const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const survivorSchema = new mongoose.Schema({
    user_id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    profession: { type: String,  },
    address: { type: String },
    phone: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: {type: String,required:true},
    id_proof: { type: String }, // Handle encryption
    address_proof: { type: String }, // Handle encryption
    role: { type: String, enum: ['survivor', 'volunteer', 'provider'], required: true },
    created_at: { type: Date, default: Date.now }
});

const Survivor = mongoose.model('Survivor', survivorSchema);

module.exports = Survivor; 
