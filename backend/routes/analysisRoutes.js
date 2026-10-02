import express from 'express';

import {
  analyzeWebsite,
  checkRelevance,
  collectEvidence,
  optimizeKeyword
} from '../controllers/analysisController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Step 1: Rank tracking
router.post(
  '/',
  authMiddleware,
  analyzeWebsite
);

// Step 2: AI keyword relevance
router.post(
  '/check-relevance',
  authMiddleware,
  checkRelevance
);

// Step 3: Collect ranking page evidence (no AI)
router.post(
  '/collect-evidence',
  authMiddleware,
  collectEvidence
);

// Step 4: AI keyword optimization (uses stored evidence)
router.post(
  '/optimize-keyword',
  authMiddleware,
  optimizeKeyword
);

export default router;