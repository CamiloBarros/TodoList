import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

/**
 * Specific validations for password change
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one lowercase, one uppercase and one number'
    ),
  handleValidationErrors,
];

/**
 * Validations for profile update
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email')
    .normalizeEmail(),
  handleValidationErrors,
];

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.profile as any);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  validateUpdateProfile,
  authController.updateProfile as any
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change authenticated user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticateToken,
  validateChangePassword,
  authController.changePassword as any
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Deactivate authenticated user account
 * @access  Private
 */
router.delete(
  '/account',
  authenticateToken,
  authController.deactivateAccount as any
);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify if JWT token is valid
 * @access  Private
 */
router.post(
  '/verify-token',
  authenticateToken,
  authController.verifyToken as any
);

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout as any);

export default router;
