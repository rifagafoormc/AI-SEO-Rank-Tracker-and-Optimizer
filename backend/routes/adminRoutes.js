import express from "express";
import {
  getAdminStats,
  getAIUsageStats,
  getAllUsers,
  deleteUser,
  createUser
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(adminOnly);

// Dashboard stats
router.get("/stats", getAdminStats);
router.get("/ai/usage-stats", getAIUsageStats);

// User Management Routes
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);

export default router;