import express from "express";

import {
  auditWebsite,
  getAuditSuggestions,
} from "../controllers/seoAuditController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/seo-audit
router.post("/", authMiddleware, auditWebsite);

// POST /api/seo-audit/suggestions
router.post(
  "/suggestions",
  authMiddleware,
  getAuditSuggestions
);

export default router;