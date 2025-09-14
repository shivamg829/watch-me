import { asyncHanlder } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validatebeforeSave: false});
        return { accessToken, refreshToken}
    }
    catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}



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
    
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
          coverImageLocalPath = req.files.coverImage[0].path;
    }

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
        username: username.toLowerCase(),
        email,
        password
    }); 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong, please try again");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );


});

const loginUser = asyncHanlder(async (req, res) => {
    // Steps:
    // get username and password from frontend
    // validate user details (not empty)
    // check if user exists
    // match password
    // generate access token and refresh token
    // send cookie
    const { username, email, password } = req.body;
    if(!username && !password){
        throw new ApiError(400, "Username and password are required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswodValid = await user.isPasswordCorrect(password);
    if (!isPasswodValid) {
        throw new ApiError(401, "Invalid credentials");
    }
    const {refreshToken, accessToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser, 
            accessToken, 
            refreshToken
        }, "User logged in successfully"
    ));


    
});

const logoutUser = asyncHanlder(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
            $set: { refreshToken: undefined }
        },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options).json(
        new ApiResponse(200, null, "User logged out successfully")
    );

})

const refreshaccessToken = asyncHanlder(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingrefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decoded = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decoded || !decoded.userId) {
            throw new ApiError(401, "Invalid refresh token");
        } 
        
        const user = await User.findById(decoded?._id);
        if(!user){
            throw new ApiError(404, "Invalid refresh token");
        }
        if(user?.refreshToken !== incomingrefreshToken){
            throw new ApiError(401, "Invalid refresh token");
        }
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const {newRefreshToken, accessToken} = await  generateAccessAndRefreshToken(user._id);
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, newRefreshToken },
            "Access token refreshed successfully")
        );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});


export { registerUser, loginUser, logoutUser, refreshaccessToken };