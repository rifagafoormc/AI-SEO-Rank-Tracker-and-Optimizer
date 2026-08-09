import jwt from "jsonwebtoken";
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Extract userId from the decoded token
    req.userId = decoded.id;
    
    // ✅ Optional: Attach full user object for convenience
    const user = await User.findById(req.userId).select('-password');
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

export default authMiddleware;