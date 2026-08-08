import express from 'express';
import Analysis from '../models/Analysis.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all history for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const history = await Analysis.find({
      userId: req.userId
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

// DELETE a specific analysis by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;