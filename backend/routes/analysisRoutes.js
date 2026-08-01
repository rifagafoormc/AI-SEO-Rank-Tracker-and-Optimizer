// analysisRoutes.js
import express from "express";
import { analyzeWebsite } from "../controllers/analysisController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, analyzeWebsite);

export default router;