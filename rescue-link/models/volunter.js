const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const volunteerSchema = new mongoose.Schema({
    volunteer_id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    profession: { type: String },
    address: { type: String },
    phone: { type: String, required: true }, // Encrypted
    email: { type: String, required: true, unique: true },
    id_proof: { type: String }, // Encrypted
    address_proof: { type: String }, // Encrypted
    role: { type: String, enum: ['full-time', 'part-time', 'self-volunteer'], required: true },
    transport: { type: String, enum: ['vehicle', 'boat', 'none'], required: true },
    created_at: { type: Date, default: Date.now }
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;
