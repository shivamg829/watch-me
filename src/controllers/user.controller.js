import { asyncHanlder } from "../utils/asyncHandler.js";

const registerUser = asyncHanlder(async (req, res) => {
    // Simulate user registration logic
    res.status(201).json({ success: true, message: 'User registered successfully' });
});

export { registerUser };