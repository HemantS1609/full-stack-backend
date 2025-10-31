# 🎬 Video Streaming Platform Backend (Node.js + Express + MongoDB)

A fully modular, production-grade backend API built using **Node.js**, **Express.js**, and **MongoDB**.  
This backend powers a complete video-sharing platform with features like user authentication, playlists, likes, comments, subscriptions, and tweets.

---

## 🚀 Features

### 🔐 User Management

- User registration and login with JWT authentication
- Secure password hashing using bcrypt
- Profile management (avatar, cover image, etc.)

### 🎥 Video Management

- Upload, update, and delete videos
- Track views and likes
- Fetch videos by user/channel
- Manage published/unpublished states

### 💬 Comments System

- Add, update, and delete comments
- Fetch comments by video or user
- Nested aggregation with user details

### ❤️ Likes

- Like/unlike videos, comments, and tweets
- Fetch like counts and user-specific like state

### 📜 Playlists

- Create and manage playlists
- Add/remove videos from playlists
- Fetch user playlists with aggregated video info

### 📊 Channel Dashboard

- Fetch total views, likes, subscribers, and uploaded videos
- Get list of all uploaded videos with stats

### 🧵 Tweets

- Create, update, and delete tweets
- Fetch user tweets with like counts and owner details

### 👥 Subscriptions

- Subscribe/unsubscribe to channels
- Fetch channel subscribers and subscribed channels
- Show subscriber count and details

### ❤️ Health Check

- `/api/v1/healthcheck` endpoint to verify server and database status

---

## 🧩 Folder Structure

project-root/
│
├── src/
│ ├── controllers/
│ │ ├── comment.controller.js
│ │ ├── dashboard.controller.js
│ │ ├── healthcheck.controller.js
│ │ ├── like.controller.js
│ │ ├── playlist.controller.js
│ │ ├── subscription.controller.js
│ │ ├── tweet.controller.js
│ │ ├── user.controller.js
│ │ └── video.controller.js
│ │
│ ├── models/
│ │ ├── user.model.js
│ │ ├── video.model.js
│ │ ├── tweet.model.js
│ │ ├── playlist.model.js
│ │ ├── comment.model.js
│ │ ├── like.model.js
│ │ └── subscription.model.js
│ │
│ ├── utils/
│ │ ├── asyncHandler.js
│ │ ├── ApiResponse.js
│ │ ├── ApiError.js
│ │ └── cloudinary.js
│ │
│ ├── middlewares/
│ │ ├── auth.middleware.js
│ │ ├── error.middleware.js
│ │ └── multer.middleware.js
│ │
│ ├── routes/
│ │ ├── comment.routes.js
│ │ ├── dashboard.routes.js
│ │ ├── healthcheck.routes.js
│ │ ├── like.routes.js
│ │ ├── playlist.routes.js
│ │ ├── subscription.routes.js
│ │ ├── tweet.routes.js
│ │ ├── user.routes.js
│ │ └── video.routes.js
│ │
│ ├── config/
│ │ ├── db.js
│ │ └── cloudinary.js
│ │
│ ├── app.js
│ └── server.js
│
├── .env
├── package.json
├── .gitignore
└── README.md

## ⚙️ Tech Stack

| Category          | Technology                              |
| ----------------- | --------------------------------------- |
| Runtime           | **Node.js (v18+)**                      |
| Framework         | **Express.js**                          |
| Database          | **MongoDB (Mongoose ODM)**              |
| Authentication    | **JWT (JSON Web Token)**                |
| File Storage      | **Multer + Cloudinary**                 |
| Response Handling | **Custom ApiResponse & ApiError**       |
| Error Management  | **Centralized asyncHandler middleware** |

---

## 🔐 Authentication Flow

1. User registers with email & password
2. Password is hashed using bcrypt
3. JWT token is issued upon successful login
4. Protected routes are secured via `auth.middleware.js`
5. Token is verified for every authenticated operation

---

## 🧰 Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/HemantS1609/full-stack-backend.git
cd video-backend

2️⃣ Install Dependencies
npm install

3️⃣ Create .env File
PORT=8000
MONGODB_URI=mongodb+srv://your_db_url
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

4️⃣ Start the Server

Development Mode:

npm run dev


Production Mode:

npm start


Server will run at:
➡️ http://localhost:8000
```

💡 Inspiration & Credits

This project was inspired by the “Chai aur Code” YouTube channel and guided by Hitesh Choudhary’s backend development series.
Special thanks for providing world-class educational content that made this learning journey possible.

🛡️ License

This project is licensed under the MIT License — you’re free to use, modify, and distribute it for personal or commercial purposes.
Credit: Chai aur Code by Hitesh Choudhary
