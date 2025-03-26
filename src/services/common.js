import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import axios from 'axios';
// import  CRYPTOJS  from '../config/index';

// const key = CryptoJS.enc.Base64.parse(CRYPTOJS.Key);
// const iv = CryptoJS.enc.Base64.parse(CRYPTOJS.Iv);

// export const encrypt = (value) => {
//     return CryptoJS.AES.encrypt(value, key, { iv }).toString();
// };

// export const decrypt = (value) => {
//     let decipher = CryptoJS.AES.decrypt(value, key, { iv });
//     return decipher.toString(CryptoJS.enc.Utf8);
// };

export const bcryptHash = async (value) => {
    return bcrypt.hash(value, bcryptSaltRounds);
};

export const bcryptCompare = async (value, hash) => {
    return bcrypt.compare(value, hash);
};

export const getIPAddress = (request) => {
    let ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;

    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); // in case the IP is in "::ffff:xxx.xxx.xxx.xxx" format
 
    return ip[0];
};

export const getLocation = async (ip) => {
    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching location data:", error.message);
        throw error;
    }
};

export const getPublicIP = async () => {
    try {
        const response = await axios.get("https://api64.ipify.org?format=json");
        return response.data.ip;
    } catch (error) {
        console.error("Error getting public IP:", error.message);
        return null;
    }
};