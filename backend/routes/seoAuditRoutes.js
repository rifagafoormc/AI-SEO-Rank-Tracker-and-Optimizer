import express from "express";
import { auditWebsite } from "../controllers/seoAuditController.js";

const router = express.Router();

// POST /api/seo-audit
router.post("/", auditWebsite);

export default router;