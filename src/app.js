import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credentials: true
}));
// Data parsing middleware
app.use(express.json({
    limit: '20kb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '20kb'
}));
app.use(express.static('public')); // Serve static files from the 'public' directory

app.use(cookieParser());

export default app;