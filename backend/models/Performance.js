import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },

    performance: {
      type: Number,
      default: null,
    },

    fcp: {
      type: Number,
      default: null,
    },

    lcp: {
      type: Number,
      default: null,
    },

    cls: {
      type: Number,
      default: null,
    },

    tbt: {
      type: Number,
      default: null,
    },

    strategy: {
      type: String,
      default: "desktop",
    },

    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
performanceSchema.index({ userId: 1, createdAt: -1 });
performanceSchema.index({ websiteUrl: 1 });

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;