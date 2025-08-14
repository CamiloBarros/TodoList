import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateRegistro, 
  validateLogin,
  handleValidationErrors
} from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

/**
 * Validaciones específicas para cambio de password
 */
const validateCambiarPassword = [
  body('passwordActual')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('passwordNueva')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  handleValidationErrors,
];

/**
 * Validaciones para actualizar perfil
 */
const validateActualizarPerfil = [
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  handleValidationErrors,
];

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/registro', validateRegistro, authController.registro);

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuario y obtener token
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   GET /api/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/perfil', authenticateToken, authController.perfil as any);

/**
 * @route   PUT /api/auth/perfil
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 */
router.put('/perfil', authenticateToken, validateActualizarPerfil, authController.actualizarPerfil as any);

/**
 * @route   POST /api/auth/cambiar-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 */
router.post('/cambiar-password', authenticateToken, validateCambiarPassword, authController.cambiarPassword as any);

/**
 * @route   DELETE /api/auth/cuenta
 * @desc    Desactivar cuenta del usuario autenticado
 * @access  Private
 */
router.delete('/cuenta', authenticateToken, authController.desactivarCuenta as any);

/**
 * @route   POST /api/auth/verificar-token
 * @desc    Verificar si el token JWT es válido
 * @access  Private
 */
router.post('/verificar-token', authenticateToken, authController.verificarToken as any);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión del usuario
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout as any);

export default router;
