
import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "processing",
        "sent",
        "failed",
        "cancelled",
      ],
      default: "scheduled",
    },

    bullJobId: {
      type: String,
      default: null,
    },

    etherealPreviewUrl: {
      type: String,
      default: null,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for dashboard queries
emailSchema.index({ status: 1, scheduledAt: 1 });

const Email = mongoose.model("Email", emailSchema);

export default Email;
