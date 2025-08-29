import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            loercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avtar: {
            type: String, // cludinary image url
            required: true,
        },
        coverImage: {
            type: String, 
        },
        WatchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ],

        // JSON Web Token for authentication
        refreshToken: {
            type: String,
        },

        // Password will be hashed before saving to the database using bcryptjs
        password: {
            type: String, 
            required: [true, "Please provide a password"]
        },

    }, {timestamps: true});
//  Generate JWT 
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}
// Generate Access and Refresh Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,  
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id 
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
}

export const User = mongoose.model("User", userSchema);