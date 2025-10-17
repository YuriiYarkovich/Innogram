import { body, validationResult } from 'express-validator';

export const validateRegistrationData = [
  body('email').isEmail().withMessage('Invalid email'),

  body('password')
    .isLength({ min: 6, max: 64 })
    .withMessage('Password has to be from 6 to 64 symbols'),

  body('username')
    .isLength({ min: 3, max: 32 })
    .withMessage('Username has to be from 3 to 32 symbols'),

  body('displayName').isString().withMessage('displayName has to be a string'),

  body('birthday')
    .isISO8601()
    .withMessage('birthday has to be of format (YYYY-MM-DD)'),

  body('bio')
    .optional()
    .isString()
    .withMessage('bio (if specified) has to be a string'),

  handleError,
];

export function handleError(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Data validation error!',
      errors: errors.array().map((e) => ({
        field: (e as any).param ?? (e as any).location ?? 'unknown',
        message: e.msg,
      })),
    });
  }
  next();
}
