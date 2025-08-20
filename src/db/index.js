import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectToDatabase = async () => {
    try {
        // Connect to MongoDB
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`MongoDB connection established: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if connection fails
    }
}

export default connectToDatabase;