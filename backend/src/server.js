
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";
import redisConnection from "./config/redis.js";
import emailQueue from "./queues/emailQueue.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/emails", emailRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Email Scheduler API is running",
    status: "success",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const redisStatus = await redisConnection.ping();

    res.status(200).json({
      status: "healthy",
      mongodb: "connected",
      redis: redisStatus === "PONG" ? "connected" : "disconnected",
      queue: "initialized",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();
    await redisConnection.ping();
    await emailQueue.waitUntilReady();

    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await emailQueue.close();
    await redisConnection.quit();

    const mongoose = await import("mongoose");
    await mongoose.default.connection.close();

    console.log("Application shut down gracefully");
    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
