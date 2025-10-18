import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// configuration and middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" })); // set the limit of data
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // configuration for get data from urlencoded
app.use(express.static("public")); // store some dummy file, image in public folder
app.use(cookieParser()); // set secure cookies on user browser

// **********************_____________routes import______________***************************
import userRoute from "./routes/user.routes.js";
// import healthcheckRouter from "./routes/healthcheck.routes.js";
// import tweetRouter from "./routes/tweet.routes.js";
// import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
// import commentRouter from "./routes/comment.routes.js";
// import likeRouter from "./routes/like.routes.js";
// import playlistRouter from "./routes/playlist.routes.js";
// import dashboardRouter from "./routes/dashboard.routes.js";

// **********************_____________routes declaration______________***************************
app.use("/api/v1/users", userRoute);
// app.use("/api/v1/healthcheck", healthcheckRouter);
// app.use("/api/v1/tweets", tweetRouter);
// app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
// app.use("/api/v1/comments", commentRouter);
// app.use("/api/v1/likes", likeRouter);
// app.use("/api/v1/playlist", playlistRouter);
// app.use("/api/v1/dashboard", dashboardRouter);

export { app };
