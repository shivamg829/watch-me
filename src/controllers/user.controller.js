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

const changeCurrentPassword = asyncHanlder(async (req, res) => {
    const { currentPassword, newPassword, confPassword } = req.body;
    if (newPassword !== confPassword) {
        throw new ApiError(400, "New password and confirm password do not match");
    }
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswodValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswodValid) {
        throw new ApiError(401, "Invalid current password");
    }
    user.password = newPassword;
    await user.save({validatebeforeSave: false});
    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );

});

const getCurrentUser = asyncHanlder(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});

const updateAccountDetails = asyncHanlder(async (req, res) => {
    const {fullName, email} = req.body;
    if(!fullName || !email){
        throw new ApiError(400, "Full name and email are required");
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName, email } },
        { new: true, runValidators: true }
    ).select("-password");
    if(!updatedUser){
        throw new ApiError(500, "Failed to update user");
    }
    
    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User updated successfully")
    );
});

const updateUserAvatar = asyncHanlder(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }
    // delete previous avatar from cloudinary
    const user = await User.findById(req.user._id);
    if(user?.avatar){
        const publicId = user.avatar.split("/").pop().split(".")[0];
        await uploadOnCloudinary("", publicId, "delete");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar");
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: true, runValidators: true }
    ).select("-password");
    if(!updatedUser){
        throw new ApiError(500, "Failed to update user");
    }
    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User avatar updated successfully")
    );
});

const updateUserCoverImage = asyncHanlder(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage){
        throw new ApiError(500, "Failed to upload cover image");
    }
    const updatedUser = await User.findById(
        req.user?._id,
        {$set: {coverImage: coverImage.url}},
        {new: true, runValidators: true}
    ).select("-password");
    if(!updatedUser){
        throw new ApiError(500, "Failed to update user");
    }
    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHanlder(async (req, res) => {
    const { username } = req.params;
    if(!username?.trim()){
        throw new ApiError(400, "Username is required");
    }
    const channel = await User.aggregate([
        { $match: { username: username?.toLowerCase() } },
        { $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }},
        { $lookup: {
            from: "subscriptions",  
            localField: "_id",
            foreignField: "Subscriber",
            as: "subscriptions"
        }},
        { $addFields: {
            subscribersCount: { $size: "$subscribers" },
            subscriptionsCount: { $size: "$subscriptions" },
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subscribers.Subscriber"] },
                    then: true,
                    else: false
                }
            }
        }},
        { $project: { 
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            subscriptionsCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1
        } }
    ]); 
    if(!channel || channel.length === 0){
        throw new ApiError(404, "Channel not found");
    }
    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel fetched successfully")
    )
})

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshaccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
};


