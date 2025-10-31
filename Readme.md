# 🎬 🎬 Video Streaming Platform Backend (Node.js + Express + MongoDB)

A production-grade backend API for a full-featured video streaming platform — similar to YouTube.
Built using Node.js, Express.js, and MongoDB, it supports user authentication, video management, likes, comments, subscriptions, playlists, and tweets.

This project follows best backend architecture practices and was inspired by **[Chai aur Code](https://www.youtube.com/@chaiaurcode)**
by **[Hitesh Choudhary](https://hiteshchoudhary.com/)**.

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

## ⚙️ Installation and Setup

1️⃣ **Clone the repository:**

```bash
git clone https://github.com/HemantS1609/full-stack-backend.git
```

2️⃣ **Install dependencies:**

```bash
cd full-stack-backend
npm install
```

3️⃣ **_Set up environment variables:_**

```bash
Create a .env file in the root of your project and fill in the required values as shown below:

PORT=8000
MONGODB_URI=mongodb+srv://your_mongodb_connection_url
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4️⃣ **_Start the server:_**

```bash
Development mode:
npm run dev
```

## 🤝 Contributing

Contributions are always welcome!
If you’d like to collaborate, fix bugs, or improve features, feel free to fork the repo and submit a pull request.

💬 You can also reach out directly if you’d like to work with me on this project.

## 💡 Inspiration & Credits

This project was inspired by the [Chai aur Code](https://www.youtube.com/@chaiaurcode) YouTube channel and guided by Hitesh Choudhary’s exceptional backend development series.
A heartfelt thanks for providing high-quality open education that empowers developers worldwide. ❤️

## 🛡️ License

This project is licensed under the MIT License — feel free to use, modify, and distribute it for personal or commercial purposes.
Credit: **[Chai aur Code](https://www.youtube.com/@chaiaurcode)** **[Hitesh Choudhary](https://hiteshchoudhary.com/)**
