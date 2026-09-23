// analysisRoutes.js

import express from "express";

import {
  analyzeWebsite,
  optimizeKeyword
} from "../controllers/analysisController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, analyzeWebsite);

router.post(
  '/optimize-keyword',
  authMiddleware,
  optimizeKeyword
);

export default router;