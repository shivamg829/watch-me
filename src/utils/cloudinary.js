// import {v2 as cloudinary} from 'cloudinary';
// import fs from 'fs'; // Import the 'fs' module to handle file system operations

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const uploadOnCloudinary = async (filePath) => {
//     try {
//         if (!fs.existsSync) return null; // Check if the file exists
//         // Upload the file to Cloudinary
//         const result = await cloudinary.uploader.upload(filePath, {
//             resource_type: 'auto', // Specify the resource type
//             folder: 'user_images', // Optional: specify a folder in Cloudinary
//             use_filename: true, // Use the original filename
//             unique_filename: false // Do not append random characters to the filename
//         });
//         // Delete the local file after upload
//         fs.unlinkSync(filePath);
//         return result.secure_url; // Return the secure URL of the uploaded image
//     } catch (error) {
//         // If there's an error, ensure the local file is deleted if it exists
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//         throw error; // Re-throw the error for further handling
//     }
// };
// export {uploadOnCloudinary};
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    FileSystem.unlinkSync(localFilePath); // remove file from local uploads folder
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export { uploadOnCloudinary };

