import { asyncHanlder } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHanlder(async (req, res) => {
    // Steps:
    // Get user details from frontend
    // validate user details (not empty, valid email, password strength, etc.)
    // check if user already exists: username or email
    // check for image file (if any) and check for avtar
    // upload image to cloudinary, avatar
    // create user object-- create entry in db
    // remove password and refresh token from response
    // check for user created successfully or not
    // return response

    const {username, email, fullName, password} = req.body
    if([username, email, fullName, password].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.tolowerCase(),
        email,
        password
    }); 
    const cretedUser = await User.findById(user._id0).select(
        "-password -refreshToken"
    );
    if (!cretedUser) {
        throw new ApiError(500, "Something went wrong, please try again");
    }
    return res.status(201).json(
        new ApiResponse(201, cretedUser, "User created successfully"
    ));
});

export { registerUser };