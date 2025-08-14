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
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           example:
 *             name: "Juan Pérez"
 *             email: "juan@example.com"
 *             password: "miPassword123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: 1
 *                   email: "juan@example.com"
 *                   name: "Juan Pérez"
 *                   created_at: "2025-08-14T10:00:00Z"
 *                   updated_at: "2025-08-14T10:00:00Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               message: "User registered successfully"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Validation failed"
 *                 type: "VALIDATION_ERROR"
 *                 statusCode: 400
 *                 timestamp: "2025-08-14T10:00:00Z"
 *       409:
 *         description: Email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Email already exists"
 *                 type: "USER_REGISTRATION_ERROR"
 *                 statusCode: 409
 *                 timestamp: "2025-08-14T10:00:00Z"
 *
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y retorna un token JWT
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *           example:
 *             email: "juan@example.com"
 *             password: "miPassword123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: 1
 *                   email: "juan@example.com"
 *                   name: "Juan Pérez"
 *                   created_at: "2025-08-14T10:00:00Z"
 *                   updated_at: "2025-08-14T10:00:00Z"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               message: "Login successful"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Invalid email or password"
 *                 type: "LOGIN_ERROR"
 *                 statusCode: 401
 *                 timestamp: "2025-08-14T10:00:00Z"
 *       403:
 *         description: Cuenta desactivada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Account is deactivated"
 *                 type: "LOGIN_ERROR"
 *                 statusCode: 403
 *                 timestamp: "2025-08-14T10:00:00Z"
 *
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna la información del perfil del usuario que está autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: 1
 *                   email: "juan@example.com"
 *                   name: "Juan Pérez"
 *                   created_at: "2025-08-14T10:00:00Z"
 *                   updated_at: "2025-08-14T10:00:00Z"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.profile as any);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza la información del perfil del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del usuario
 *                 example: "Juan Carlos Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo email del usuario
 *                 example: "juan.carlos@example.com"
 *           example:
 *             name: "Juan Carlos Pérez"
 *             email: "juan.carlos@example.com"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email ya está en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
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
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario
 *     description: Permite al usuario autenticado cambiar su contraseña actual
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['currentPassword', 'newPassword']
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: "miPasswordActual123"
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (mínimo 8 caracteres, debe contener mayúscula, minúscula y número)
 *                 example: "miNuevaPassword456"
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Contraseña actual incorrecta o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Current password is incorrect"
 *                 type: "PASSWORD_CHANGE_ERROR"
 *                 statusCode: 400
 *                 timestamp: "2025-08-14T10:00:00Z"
 *       401:
 *         description: Token no válido o no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
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
