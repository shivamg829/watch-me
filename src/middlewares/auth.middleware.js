import {asyncHanlder} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHanlder(async (req, _, next) => {
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){

            throw new ApiError(401, "Unauthorized: User not found");
        }
        req.user = user;
        next();
} catch (error) {
    throw new ApiError(401, "Unauthorized: Invalid token");
}

})