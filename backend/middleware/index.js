import authMiddleware from './authMiddleware.js';
import { adminOnly, hasRole } from './adminMiddleware.js';

// Combine middleware for cleaner imports
export const auth = authMiddleware;
export const admin = adminOnly;
export const roles = hasRole;

export default {
  auth,
  admin,
  roles,
};