import CryptoJS from 'crypto-js';

const SECRET_KEY = '12345678901234567890123456789012'; // Must be 32 characters

export function encryptPassword(password) {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
}
