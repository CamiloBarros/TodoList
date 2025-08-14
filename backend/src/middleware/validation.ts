import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Datos de entrada inválidos',
        type: 'VALIDATION_ERROR',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: errorDetails,
      },
    });
    return;
  }

  next();
};

/**
 * Validaciones para autenticación
 */
export const validateRegistro = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('nombre')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors,
];

/**
 * Validaciones para tareas
 */
export const validateCrearTarea = [
  body('titulo')
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres')
    .trim(),
  body('descripcion')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .trim(),
  body('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de categoría debe ser un número entero positivo'),
  body('prioridad')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('La prioridad debe ser: baja, media o alta'),
  body('fecha_vencimiento')
    .optional()
    .isISO8601()
    .withMessage('La fecha de vencimiento debe ser una fecha válida en formato ISO 8601'),
  body('etiquetas')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array')
    .custom((etiquetas) => {
      if (etiquetas && etiquetas.length > 0) {
        const validIds = etiquetas.every((id: any) => Number.isInteger(id) && id > 0);
        if (!validIds) {
          throw new Error('Todas las etiquetas deben ser IDs enteros positivos');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateActualizarTarea = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la tarea debe ser un número entero positivo'),
  body('titulo')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres')
    .trim(),
  body('descripcion')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
    .trim(),
  body('categoria_id')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Permite null para eliminar categoría
      if (!Number.isInteger(value) || value < 1) {
        throw new Error('El ID de categoría debe ser un número entero positivo o null');
      }
      return true;
    }),
  body('prioridad')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('La prioridad debe ser: baja, media o alta'),
  body('fecha_vencimiento')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Permite null para eliminar fecha
      if (!new Date(value).getTime()) {
        throw new Error('La fecha de vencimiento debe ser una fecha válida o null');
      }
      return true;
    }),
  body('completada')
    .optional()
    .isBoolean()
    .withMessage('El estado completada debe ser true o false'),
  body('etiquetas')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array')
    .custom((etiquetas) => {
      if (etiquetas && etiquetas.length > 0) {
        const validIds = etiquetas.every((id: any) => Number.isInteger(id) && id > 0);
        if (!validIds) {
          throw new Error('Todas las etiquetas deben ser IDs enteros positivos');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Validaciones para categorías
 */
export const validateCrearCategoria = [
  body('nombre')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres')
    .trim(),
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF0000)'),
  handleValidationErrors,
];

export const validateActualizarCategoria = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la categoría debe ser un número entero positivo'),
  body('nombre')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres')
    .trim(),
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF0000)'),
  handleValidationErrors,
];

/**
 * Validaciones para etiquetas
 */
export const validateCrearEtiqueta = [
  body('nombre')
    .isLength({ min: 1, max: 30 })
    .withMessage('El nombre debe tener entre 1 y 30 caracteres')
    .trim()
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, guiones y guiones bajos'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF0000)'),
  handleValidationErrors,
];

export const validateActualizarEtiqueta = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la etiqueta debe ser un número entero positivo'),
  body('nombre')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('El nombre debe tener entre 1 y 30 caracteres')
    .trim()
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('El nombre solo puede contener letras, números, espacios, guiones y guiones bajos'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF0000)'),
  handleValidationErrors,
];

/**
 * Validaciones comunes
 */
export const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID debe ser un número entero positivo'),
  handleValidationErrors,
];

export const validatePaginacion = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
  query('ordenar')
    .optional()
    .isIn(['creado_en', 'fecha_vencimiento', 'prioridad', 'titulo'])
    .withMessage('Orden válido: creado_en, fecha_vencimiento, prioridad, titulo'),
  query('direccion')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Dirección válida: asc, desc'),
  handleValidationErrors,
];

export const validateFiltrosTareas = [
  query('completada')
    .optional()
    .isBoolean()
    .withMessage('El filtro completada debe ser true o false'),
  query('categoria')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El filtro categoría debe ser un número entero positivo'),
  query('prioridad')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('El filtro prioridad debe ser: baja, media o alta'),
  query('fecha_vencimiento')
    .optional()
    .isISO8601()
    .withMessage('El filtro fecha_vencimiento debe ser una fecha válida en formato ISO 8601'),
  query('busqueda')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres')
    .trim(),
  query('etiquetas')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const ids = value.split(',').map(id => parseInt(id.trim()));
        const validIds = ids.every(id => Number.isInteger(id) && id > 0);
        if (!validIds) {
          throw new Error('Las etiquetas deben ser una lista de IDs separados por comas');
        }
      }
      return true;
    }),
  validatePaginacion,
];
