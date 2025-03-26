import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MONGO_URI } from '../config/index.js';
console.log("MONGO_URI", MONGO_URI)
// Load environment variables
dotenv.config();

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(MONGO_URI);
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         process.exit(1);
//     }
// };
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);  // Exit the process if the connection fails
    }
};
export default connectDB;
