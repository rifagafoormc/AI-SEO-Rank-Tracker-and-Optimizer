import express from "express";
import {
  auditWebsite,
  getAuditSuggestions,
} from "../controllers/seoAuditController.js";

const router = express.Router();

// POST /api/seo-audit
router.post("/", auditWebsite);

// POST /api/seo-audit/suggestions
router.post("/suggestions", getAuditSuggestions);

export default router;