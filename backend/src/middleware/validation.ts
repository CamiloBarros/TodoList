import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((error) => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid input data',
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
 * Authentication validations
 */
export const validateRegister = [
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase, one uppercase and one number'
    ),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Task validations
 */
export const validateCreateTask = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium or high'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO 8601 format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        const validIds = tags.every(
          (id: any) => Number.isInteger(id) && id > 0
        );
        if (!validIds) {
          throw new Error('All tags must be positive integer IDs');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateUpdateTask = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  body('category_id')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Allow null to remove category
      if (!Number.isInteger(value) || value < 1) {
        throw new Error('Category ID must be a positive integer or null');
      }
      return true;
    }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be: low, medium or high'),
  body('due_date')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Allow null to remove date
      if (!new Date(value).getTime()) {
        throw new Error('Due date must be a valid date or null');
      }
      return true;
    }),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed status must be true or false'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 0) {
        const validIds = tags.every(
          (id: any) => Number.isInteger(id) && id > 0
        );
        if (!validIds) {
          throw new Error('All tags must be positive integer IDs');
        }
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Category validations
 */
export const validateCreateCategory = [
  body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hexadecimal code (e.g: #FF0000)'),
  handleValidationErrors,
];

export const validateUpdateCategory = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hexadecimal code (e.g: #FF0000)'),
  handleValidationErrors,
];

/**
 * Tag validations
 */
export const validateCreateTag = [
  body('name')
    .isLength({ min: 1, max: 30 })
    .withMessage('Name must be between 1 and 30 characters')
    .trim()
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage(
      'Name can only contain letters, numbers, spaces, hyphens and underscores'
    ),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hexadecimal code (e.g: #FF0000)'),
  handleValidationErrors,
];

export const validateUpdateTag = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('Name must be between 1 and 30 characters')
    .trim()
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage(
      'Name can only contain letters, numbers, spaces, hyphens and underscores'
    ),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hexadecimal code (e.g: #FF0000)'),
  handleValidationErrors,
];

/**
 * Common validations
 */
export const validateIdParam = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  handleValidationErrors,
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a number between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['created_at', 'due_date', 'priority', 'title'])
    .withMessage('Valid sort options: created_at, due_date, priority, title'),
  query('direction')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Valid direction: asc, desc'),
  handleValidationErrors,
];

export const validateTaskFilters = [
  query('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed filter must be true or false'),
  query('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category filter must be a positive integer'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority filter must be: low, medium or high'),
  query('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date filter must be a valid date in ISO 8601 format'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search must be between 1 and 100 characters')
    .trim(),
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const ids = value.split(',').map((id) => parseInt(id.trim()));
        const validIds = ids.every((id) => Number.isInteger(id) && id > 0);
        if (!validIds) {
          throw new Error('Tags must be a comma-separated list of IDs');
        }
      }
      return true;
    }),
  validatePagination,
];
