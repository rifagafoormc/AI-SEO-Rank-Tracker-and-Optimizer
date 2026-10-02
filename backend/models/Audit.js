import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
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

    seoScore: {
      type: Number,
      default: null,
    },

    title: {
      type: String,
      default: "",
    },

    titleLength: {
      type: Number,
      default: 0,
    },

    metaDescription: {
      type: String,
      default: "",
    },

    metaDescriptionLength: {
      type: Number,
      default: 0,
    },

    canonical: {
      type: String,
      default: "",
    },

    robots: {
      type: String,
      default: "",
    },

    openGraph: {
      type: Boolean,
      default: false,
    },

    viewport: {
      type: Boolean,
      default: false,
    },

    language: {
      type: String,
      default: "",
    },

    structuredData: {
      type: Boolean,
      default: false,
    },

    structuredDataCount: {
      type: Number,
      default: 0,
    },

    headings: {
      type: Object,
      default: {},
    },

    h1Texts: {
      type: [String],
      default: [],
    },

    images: {
      type: Object,
      default: {},
    },

    links: {
      type: Object,
      default: {},
    },

    wordCount: {
      type: Number,
      default: 0,
    },

    loadTime: {
      type: Number,
      default: 0,
    },

    checks: {
      type: Object,
      default: {},
    },

    issues: {
      type: [Object],
      default: [],
    },

    aiSuggestions: {
      type: [Object],
      default: [],
    },

    statusCode: {
      type: Number,
      default: null,
    },

    contentType: {
      type: String,
      default: "",
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

auditSchema.index({ userId: 1, createdAt: -1 });
auditSchema.index({ websiteUrl: 1 });

const Audit = mongoose.model("Audit", auditSchema);

export default Audit;