
import mongoose from "mongoose";
import Email from "../models/Email.js";
import emailQueue from "../queues/emailQueue.js";

export const scheduleEmail = async (req, res) => {
  let savedEmail = null;

  try {
    console.log("SCHEDULE EMAIL ROUTE HIT");
    console.log("REQUEST BODY:", req.body);
    const { recipient, subject, body, scheduledAt } = req.body;

    // 1. Validate required fields
    if (!recipient || !subject || !body || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Recipient, subject, body and scheduledAt are required",
      });
    }

    // 2. Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(recipient)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid recipient email address",
      });
    }

    // 3. Validate scheduled date
    const scheduledDate = new Date(scheduledAt);

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    if (scheduledDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled time must be in the future",
      });
    }

    // 4. Create MongoDB email record
    savedEmail = await Email.create({
      recipient: recipient.trim().toLowerCase(),
      subject: subject.trim(),
      body,
      scheduledAt: scheduledDate,
      status: "scheduled",
    });
    console.log("EMAIL CREATED:", savedEmail._id);
    console.log("COLLECTION:", Email.collection.name);
    console.log("DATABASE:", mongoose.connection.name);
    console.log("EMAIL COUNT:", await Email.countDocuments());

    // 5. Add delayed job to BullMQ
    const job = await emailQueue.add(
      "send-email",
      {
        emailId: savedEmail._id.toString(),
      },
      {
        jobId: savedEmail._id.toString(),
        delay: Math.max(0, scheduledDate.getTime() - Date.now()),
      }
    );

    // 6. Save BullMQ job ID
    savedEmail.bullJobId = job.id;
    await savedEmail.save();

    // 7. Return success response
    return res.status(201).json({
      success: true,
      message: "Email scheduled successfully",
      data: savedEmail,
    });

  } catch (error) {
    console.error("Schedule email error:", error);

    // Compensate if queue creation or subsequent DB update fails
    if (savedEmail) {
      try {
        const job = await emailQueue.getJob(savedEmail._id.toString());

        if (job) {
          await job.remove();
        }

        await Email.findByIdAndDelete(savedEmail._id);
      } catch (rollbackError) {
        console.error("Scheduling rollback failed:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to schedule email",
      error: error.message,
    });
  }
};

export const getEmails = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      const allowedStatuses = [
        "scheduled",
        "processing",
        "sent",
        "failed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email status",
        });
      }

      filter.status = status;
    }

    const emails = await Email.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error) {
    console.error("Get emails error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch emails",
      error: error.message,
    });
  }
};
