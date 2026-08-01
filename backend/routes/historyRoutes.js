import express from 'express';
import Analysis from '../models/Analysis.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const history = await Analysis.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;