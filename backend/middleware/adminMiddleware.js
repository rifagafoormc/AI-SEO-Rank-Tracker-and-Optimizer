import User from '../models/User.js';

/**
 * Admin middleware - Checks if the authenticated user has admin role
 * This should be used AFTER the authMiddleware
 */
export const adminOnly = async (req, res, next) => {
  try {
    // Get user from database using userId from auth middleware
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authorization',
    });
  }
};

/**
 * Optional: Check if user has any of the specified roles
 * Usage: hasRole(['admin', 'moderator'])
 */
export const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in role authorization',
      });
    }
  };
};