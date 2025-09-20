# YouTube Clone - Backend

A complete backend for a YouTube-like application built with Node.js, Express, Mongoose.

## Features

- User authentication (register/login)
- Video upload and streaming
- Subscription management

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file and add:
```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/youtube-clone
JWT_SECRET=your_secret_key
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/videos` - Upload video
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get specific video
- `POST /api/videos/:id/like` - Like/Dislike video
- `POST /api/videos/:id/comment` - Add comment

## Project Structure

- `models/` - Mongoose schemas
- `controllers/` - Route handlers
- `middleware/` - Authentication & validation
- `routes/` - API routes
- `utils/` - Helper functions
