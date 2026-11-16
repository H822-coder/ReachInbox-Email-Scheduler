
import "dotenv/config";
import mongoose from "mongoose";
import { Worker } from "bullmq";

import connectDB from "../config/db.js";
import redisConnection from "../config/redis.js";
import Email from "../models/Email.js";
import { sendEmail, verifySMTP } from "../services/emailService.js";

async function startWorker() {
  await connectDB();
  await redisConnection.ping();
  await verifySMTP();

  console.log("SMTP connection verified");

  const worker = new Worker(
    "email-queue",
    async (job) => {
      const email = await Email.findById(job.data.emailId);

      if (!email) {
        throw new Error("Email record not found");
      }

      if (email.status === "sent" || email.status === "cancelled") {
        return { skipped: true };
      }

      await Email.findByIdAndUpdate(email._id, {
        status: "processing",
        errorMessage: null,
      });

      try {
        const result = await sendEmail(email);

        await Email.findByIdAndUpdate(email._id, {
          status: "sent",
          sentAt: new Date(),
          etherealPreviewUrl: result.previewUrl,
          errorMessage: null,
        });

        console.log(`Email sent: ${email.recipient}`);

        return result;
      } catch (error) {
        const finalAttempt =
          job.attemptsMade + 1 >= (job.opts.attempts || 1);

        await Email.findByIdAndUpdate(email._id, {
          status: finalAttempt ? "failed" : "scheduled",
          retryCount: job.attemptsMade + 1,
          errorMessage: error.message,
        });

        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed: ${error.message}`);
  });

  worker.on("error", (error) => {
    console.error("Worker error:", error.message);
  });

  async function shutdown() {
    console.log("Stopping email worker...");
    await worker.close();
    await redisConnection.quit();
    await mongoose.connection.close();
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log("Email worker started");
}

startWorker().catch((error) => {
  console.error("Worker startup failed:", error);
  process.exit(1);
});
