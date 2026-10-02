import express from 'express';

import Analysis from '../models/Analysis.js';
import Audit from '../models/Audit.js';
import Performance from '../models/Performance.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all history for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const [analyses, audits, performances] = await Promise.all([
      Analysis.find({ userId }).sort({ createdAt: -1 }),
      Audit.find({ userId }).sort({ createdAt: -1 }),
      Performance.find({ userId }).sort({ createdAt: -1 }),
    ]);

    const history = [
      ...analyses.map((item) => ({
        ...item.toObject(),
        type: 'analysis',
      })),

      ...audits.map((item) => ({
        ...item.toObject(),
        type: 'audit',
      })),

      ...performances.map((item) => ({
        ...item.toObject(),
        type: 'performance',
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('History fetch error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// DELETE a specific history item
router.delete('/:type/:id', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.userId;

    let deleted = null;

    if (type === 'analysis') {
      deleted = await Analysis.findOneAndDelete({
        _id: id,
        userId,
      });
    } else if (type === 'audit') {
      deleted = await Audit.findOneAndDelete({
        _id: id,
        userId,
      });
    } else if (type === 'performance') {
      deleted = await Performance.findOneAndDelete({
        _id: id,
        userId,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid history type',
      });
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'History item not found',
      });
    }

    res.json({
      success: true,
      message: `${type} deleted successfully`,
    });
  } catch (error) {
    console.error('History delete error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;