import { body } from 'express-validator';
import { handleError } from './registration-data-validation.middleware';

export const validateLoginData = [
  body('email').isEmail().withMessage('Invalid email'),

  body('password')
    .isLength({ min: 6, max: 64 })
    .withMessage('Password has to be from 6 to 64 symbols'),

  handleError,
];
