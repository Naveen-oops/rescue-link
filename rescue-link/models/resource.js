const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const resourceSchema = new mongoose.Schema({
    resource_id: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    super_category: {
        type: String,
        enum: ['Basic Amenities', 'Medical Support', 'Other'],
        required: true
    },
    sub_category: { type: String },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
