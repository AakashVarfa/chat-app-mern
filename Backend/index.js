import dotenv from "dotenv";

dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");


// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

app.use(cookieParser());


// =========================
// CORS
// =========================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);


// =========================
// PORT & DATABASE
// =========================

const PORT = process.env.PORT || 5002;

const URI = process.env.MONGODB_URI;


// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(URI)

  .then(() => {
    console.log("Connected to MongoDB");


    // =========================
    // API ROUTES
    // =========================

    app.use("/api/user", userRoute);

    app.use("/api/message", messageRoute);


    // =========================
    // PRODUCTION FRONTEND
    // =========================

    if (process.env.NODE_ENV === "production") {
      const frontendPath = path.join(projectRoot, "Frontend", "dist");

      app.use(express.static(frontendPath));

      app.get("*", (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
      });
    }


    // =========================
    // START SERVER
    // =========================

    server.listen(PORT, () => {
      console.log(
        `Server is Running on port ${PORT}`
      );
    });
  })

  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });