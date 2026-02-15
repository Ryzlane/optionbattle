import express from 'express';
import { body } from 'express-validator';
import {
  getArguments,
  getArgument,
  createArgument,
  updateArgument,
  deleteArgument
} from '../controllers/argument.controller.js';
import { validate } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });

// Validation rules
const createArgumentValidation = [
  body('text')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Le texte doit contenir entre 3 et 500 caractères'),
  body('type')
    .isIn(['power', 'weakness'])
    .withMessage('Le type doit être "power" ou "weakness"'),
  body('weight')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Le Power Level doit être entre 1 et 5')
];

const updateArgumentValidation = [
  body('text')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Le texte doit contenir entre 3 et 500 caractères'),
  body('type')
    .optional()
    .isIn(['power', 'weakness'])
    .withMessage('Le type doit être "power" ou "weakness"'),
  body('weight')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Le Power Level doit être entre 1 et 5')
];

// Routes arguments
router.get('/', getArguments);
router.get('/:id', getArgument);
router.post('/', createArgumentValidation, validate, createArgument);
router.put('/:id', updateArgumentValidation, validate, updateArgument);
router.delete('/:id', deleteArgument);

export default router;
