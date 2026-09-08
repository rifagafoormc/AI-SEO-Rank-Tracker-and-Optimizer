import express from "express";
import { analyzePerformance } from "../controllers/performanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, analyzePerformance);

export default router;