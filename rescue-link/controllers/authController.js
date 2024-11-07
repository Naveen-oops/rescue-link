const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Survivor = require('../models/survivor');
const logger = require('../utils/logger');
const { encrypt, decrypt } = require('../cryptplugin/crypt');

const register = async (req, res) => {
    try {
        const { name, age, profession, address, phone, email, password, role, id_proof, address_proof } = req.body;

        if (age < 18) {
            return res.status(400).json({ message: 'Age must be 18 or older.' });
        }

        const existingUser = await Survivor.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedPhone = encrypt(phone);
        const encryptedIdProof = encrypt(id_proof);
        const encryptedAddressProof = encrypt(address_proof);

        const user = new Survivor({ 
            name, 
            age, 
            profession, 
            address, 
            phone: JSON.stringify(encryptedPhone), 
            email, 
            password: hashedPassword, 
            role, 
            id_proof: JSON.stringify(encryptedIdProof), 
            address_proof: JSON.stringify(encryptedAddressProof) 
        });

        await user.save();
        logger.info(`User registered: ${email}`);
        res.status(201).json({ user_id: user.user_id });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await Survivor.findOne({ user_id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info("Fetched user details:", user);

        const decryptedPhone = decryptValue(user.phone);
        const decryptedIdProof = decryptValue(user.id_proof);
        const decryptedAddressProof = decryptValue(user.address_proof);

        res.json({
            user_id: user.user_id,
            name: user.name,
            age: user.age,
            profession: user.profession,
            address: user.address,
            phone: decryptedPhone,
            password: user.password,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            id_proof: decryptedIdProof,
            address_proof: decryptedAddressProof
        });
    } catch (error) {
        logger.error(`Get user error: ${error.message}`);
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

const getAllUsers = async (req, res) => {
    try {
        const users = await Survivor.find();
        logger.info("Fetched users:", users); 

        const decryptedUsers = users.map(user => ({
            user_id: user.user_id,
            name: user.name,
            age: user.age,
            profession: user.profession,
            address: user.address,
            phone: decryptValue(user.phone),
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            id_proof: decryptValue(user.id_proof),
            address_proof: decryptValue(user.address_proof)
        }));

        res.json(decryptedUsers);
    } catch (error) {
        logger.error(`Get all users error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const unregisterUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await Survivor.deleteOne({ user_id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User unregistered successfully' });
    } catch (error) {
        logger.error(`Unregister user error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const unregisterAllUsers = async (req, res) => {
    try {
        const result = await Survivor.deleteMany({}); // This will delete all user records

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No users found to delete' });
        }

        res.status(200).json({ message: 'All users unregistered successfully' });
    } catch (error) {
        logger.error(`Unregister all users error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserRole = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await Survivor.findOne({ user_id }, 'role'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ role: user.role });
    } catch (error) {
        logger.error(`Fetch user role error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body; 
        const user = await Survivor.findOne({ email }); 

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_TOKEN,
            { expiresIn: '1h' } 
        );

        logger.info(`User logged in: ${email}`);
        
        res.json({ access_token: token, role: user.role });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    try {
        res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
        logger.error(`Logout error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    register,
    getUserById,
    getAllUsers,
    unregisterUser,
    unregisterAllUsers,
    getUserRole,
    login,
    logout
};
