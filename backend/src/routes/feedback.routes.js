import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { submitFeedback, getFeedbacks, updateFeedbackStatus } from '../controllers/feedback.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const submitFeedbackValidation = [
  body('pageUrl').isURL().withMessage('URL invalide'),
  body('message').optional().isString().trim().isLength({ max: 5000 }),
  body('screenshot').optional().isString(),
  body('userAgent').optional().isString()
];

const updateStatusValidation = [
  param('id').isUUID(),
  body('status').isIn(['pending', 'reviewed', 'resolved'])
];

// Routes publiques (avec auth optionnelle)
router.post('/', optionalAuth, submitFeedbackValidation, validate, submitFeedback);

// Routes admin (TODO: ajouter middleware isAdmin)
router.get('/', getFeedbacks);
router.patch('/:id', updateStatusValidation, validate, updateFeedbackStatus);

export default router;
