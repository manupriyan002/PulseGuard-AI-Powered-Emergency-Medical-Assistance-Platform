const CryptoJS = require('crypto-js');

/**
 * Encrypt data using AES-256
 * @param {string} data - Plain text to encrypt
 * @returns {string} Encrypted string
 */
const encrypt = (data) => {
  if (!data) return data;
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.AES_ENCRYPTION_KEY
  ).toString();
};

/**
 * Decrypt AES-256 encrypted data
 * @param {string} encryptedData - Encrypted string
 * @returns {any} Decrypted data
 */
const decrypt = (encryptedData) => {
  if (!encryptedData) return encryptedData;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.AES_ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
};

module.exports = { encrypt, decrypt };
