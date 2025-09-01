// Importing environment variables from .env file
// require("dotenv").config({path: "./src/config/.env"});
// // // // import from db/index.js- APPROACH 1
import connectToDatabase from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import app from "./app.js";
// ---------------------------------------------------
connectToDatabase()
.then(()=> {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("Error connecting to the database:", error);  
});
   













































































// -------------------------------------------------------------------
// // // // Important approach to connect to MongoDB using Mongoose- APPROACH 2
// import mongoose from "mongoose";
// import { DB_NAME } from "./constant.js";
// import express from "express";
// const app = express();

// // ifie async function to avoid top-level await
// ( async() => {
//     try {
//         // Connect to MongoDB
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//         app.on('error', (err) => {
//             console.error("Error connecting to MongoDB:", err);
//             throw err;
//         });
//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     }
//     catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//     }
// }) ()
// ------------------------------------------------------------------------


