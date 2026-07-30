import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  websiteUrl: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    required: true,
  },
  pageSpeedData: {
    type: Object,
    default: null,
  },
  rankingData: {
    type: Object,
    default: null,
  },
  aiSuggestions: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  }
}, {
  timestamps: true,
});

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;