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

// **********************_____________routes declaration______________***************************
app.use("/api/v1/users", userRoute);

export { app };
