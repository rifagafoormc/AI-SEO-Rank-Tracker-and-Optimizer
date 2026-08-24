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
  // ✅ NEW: Country field to store which Google country was searched
  country: {
    type: String,
    default: 'in',
    required: false,
  },
  // ✅ NEW: Search Depth field to store how many results were searched
  searchDepth: {
    type: Number,
    default: 100,
    required: false,
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

// ✅ OPTIONAL: Add indexes for better query performance
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ websiteUrl: 1 });
analysisSchema.index({ status: 1 });

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;