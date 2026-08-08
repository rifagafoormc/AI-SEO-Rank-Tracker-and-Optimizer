import express from "express";
import { registerUser, loginUser, changePassword } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.put("/change-password", authMiddleware, changePassword);

export default router;