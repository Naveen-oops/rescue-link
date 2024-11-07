const crypto = require('crypto');

const algorithm = 'aes-256-cbc'; // Define the algorithm
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.IV, 'hex');

// Encrypt function
const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
};

// Decrypt function
const decrypt = (encryption) => {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryption.iv, 'hex'));
    let decrypted = decipher.update(encryption.encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};

module.exports = { encrypt, decrypt };
