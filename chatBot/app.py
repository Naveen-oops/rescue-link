import os
import requests
import openai
import spacy
from transformers import pipeline
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO
from langdetect import detect

app = Flask(__name__)
socketio = SocketIO(app)

openai.api_key = 'REDACTED'

nlp = spacy.load("en_core_web_sm")

intent_classifier = pipeline(
    "zero-shot-classification",
    model="LOCAL_PATH\\bart-large-mnli"
)

OFFLINE_DATA = {
    "earthquake_guidelines": {
        "checklist": [
            "Drop, cover, and hold on.",
            "Stay indoors until the shaking stops.",
            "Avoid windows and heavy furniture."
        ],
        "info": "In case of an earthquake, be prepared to follow these guidelines."
    },
    "flood_guidelines": {
        "checklist": [
            "Move to higher ground.",
            "Avoid flooded areas.",
            "Stay informed about the weather."
        ],
        "info": "If a flood is likely, follow these safety measures."
    },
    "wildfire_guidelines": {
        "checklist": [
            "Create a defensible space around your home.",
            "Prepare an evacuation plan.",
            "Stay informed through local news."
        ],
        "info": "Prepare yourself in case of a wildfire."
    },
    "tornado_guidelines": {
        "checklist": [
            "Seek shelter in a sturdy building.",
            "Preferably go to a basement or an interior room.",
            "Stay tuned to local weather reports."
        ],
        "info": "Here are the steps to take during a tornado."
    },
    "hurricane_guidelines": {
        "checklist": [
            "Evacuate if advised.",
            "Prepare emergency kits with food, water, and supplies.",
            "Secure your property."
        ],
        "info": "Be prepared for hurricanes with these guidelines."
    },
    "mental_health_resources": {
        "checklist": [
            "Practice deep breathing exercises.",
            "Connect with friends and family.",
            "Seek professional help if needed."
        ],
        "info": "Take care of your mental health during disasters."
    }
}


def get_user_location():
    try:
        response = requests.get('https://ipinfo.io/json')
        location_data = response.json()
        return location_data.get("city", "Unknown Location")
    except Exception as e:
        print(f"Error fetching location: {e}")
        return "Unknown Location"

def get_weather(location):
    weather_api_key = "REDACTED"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={weather_api_key}&units=metric"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            weather_data = response.json()
            return f"Current weather in {location}: {weather_data['weather'][0]['description']}, " \
                   f"temperature: {weather_data['main']['temp']}°C."
        return "Could not retrieve weather data."
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return "Could not retrieve weather data."

def translate_text(text, target_lang="en"):
    url = "https://libretranslate.com/translate"
    try:
        response = requests.post(url, json={
            "q": text,
            "source": "auto",
            "target": target_lang
        })
        return response.json()["translatedText"]
    except Exception as e:
        print(f"Error translating text: {e}")
        return text

def generate_online_response(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.9,
        max_tokens=150
    )
    return response.choices[0].message['content'].strip()

def generate_offline_response(intent):
    if intent in OFFLINE_DATA:
        checklist = "\n".join(OFFLINE_DATA[intent]["checklist"])
        info = OFFLINE_DATA[intent]["info"]
        return f"{info}\n\nChecklist:\n{checklist}"
    return "I'm here to help with basic information and support."

def classify_intent_offline(text):
    labels = list(OFFLINE_DATA.keys())
    result = intent_classifier(text, labels)
    return result['labels'][0]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get("message", "")
    online_status = data.get("online_status", True)
    
    language = detect(message)
    if language != "en":
        message = translate_text(message, target_lang="en")
    
    if online_status:
        location = get_user_location()
        weather_info = get_weather(location)
        response = generate_online_response(message)
        complete_response = f"{response}\n\n{weather_info}"
    else:
        intent = classify_intent_offline(message)
        response = generate_offline_response(intent)
        complete_response = response

    if language != "en":
        complete_response = translate_text(complete_response, target_lang=language)

    return jsonify({"response": complete_response})

if __name__ == '__main__':
    socketio.run(app, debug=True)
