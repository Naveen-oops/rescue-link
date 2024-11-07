const bcrypt = require('bcryptjs');
const Volunteer = require('../models/volunter');
const logger = require('../utils/logger');
const { encrypt, decrypt } = require('../cryptplugin/crypt');

const registerVolunteer = async (req, res) => {
    try {
        const { name, age, profession, address, phone, email, id_proof, address_proof, role, transport } = req.body;

        if (age < 18) {
            return res.status(400).json({ message: 'Age must be 18 or older.' });
        }

        const existingVolunteer = await Volunteer.findOne({ email });
        if (existingVolunteer) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const encryptedPhone = encrypt(phone);
        const encryptedIdProof = encrypt(id_proof);
        const encryptedAddressProof = encrypt(address_proof);

        const volunteer = new Volunteer({ 
            name, 
            age, 
            profession, 
            address, 
            phone: JSON.stringify(encryptedPhone), 
            email, 
            role, 
            transport, 
            id_proof: JSON.stringify(encryptedIdProof), 
            address_proof: JSON.stringify(encryptedAddressProof) 
        });

        await volunteer.save();
        logger.info(`Volunteer registered: ${email}`);
        res.status(201).json({ volunteer_id: volunteer.volunteer_id });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getVolunteerById = async (req, res) => {
    try {
        const { volunteer_id } = req.params;
        const volunteer = await Volunteer.findOne({ volunteer_id });

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        logger.info("Fetched volunteer details:", volunteer);

        const decryptedPhone = decryptValue(volunteer.phone);
        const decryptedIdProof = decryptValue(volunteer.id_proof);
        const decryptedAddressProof = decryptValue(volunteer.address_proof);

        res.json({
            volunteer_id: volunteer.volunteer_id,
            name: volunteer.name,
            age: volunteer.age,
            profession: volunteer.profession,
            address: volunteer.address,
            phone: decryptedPhone,
            email: volunteer.email,
            role: volunteer.role,
            transport: volunteer.transport,
            created_at: volunteer.created_at,
            id_proof: decryptedIdProof,
            address_proof: decryptedAddressProof
        });
    } catch (error) {
        logger.error(`Get volunteer error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const decryptValue = (value) => {
    try {
        if (value && typeof value === 'string') {
            const parsedValue = JSON.parse(value);
            return decrypt(parsedValue);
        }
        return null; 
    } catch (error) {
        logger.error(`Decryption error for value: ${error.message}`);
        return null; 
    }
};

const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find();
        logger.info("Fetched volunteers:", volunteers);

        const decryptedVolunteers = volunteers.map(volunteer => ({
            volunteer_id: volunteer.volunteer_id,
            name: volunteer.name,
            age: volunteer.age,
            profession: volunteer.profession,
            address: volunteer.address,
            phone: decryptValue(volunteer.phone),
            email: volunteer.email,
            role: volunteer.role,
            transport: volunteer.transport,
            created_at: volunteer.created_at,
            id_proof: decryptValue(volunteer.id_proof),
            address_proof: decryptValue(volunteer.address_proof)
        }));

        res.json(decryptedVolunteers);
    } catch (error) {
        logger.error(`Get all volunteers error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const unregisterVolunteer = async (req, res) => {
    try {
        const { volunteer_id } = req.params;
        const result = await Volunteer.deleteOne({ volunteer_id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        res.status(200).json({ message: 'Volunteer unregistered successfully' });
    } catch (error) {
        logger.error(`Unregister volunteer error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const unregisterAllVolunteers = async (req, res) => {
    try {
        const result = await Volunteer.deleteMany({}); // This will delete all volunteer records

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No volunteers found to delete' });
        }

        res.status(200).json({ message: 'All volunteers unregistered successfully' });
    } catch (error) {
        logger.error(`Unregister all volunteers error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    registerVolunteer,
    getVolunteerById,
    getAllVolunteers,
    unregisterVolunteer,
    unregisterAllVolunteers
};
