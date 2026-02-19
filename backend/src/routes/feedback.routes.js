import express from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { submitFeedback, getFeedbacks, updateFeedbackStatus } from '../controllers/feedback.controller.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validations
const submitFeedbackValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('message').optional().trim().isLength({ max: 5000 }),
  body('screenshot').optional().isString(),
  body('pageUrl').isURL(),
  body('userAgent').optional().isString()
];

const getFeedbacksValidation = [
  query('status').optional().isIn(['pending', 'reviewed', 'resolved']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
];

const updateFeedbackValidation = [
  param('id').isUUID(),
  body('status').isIn(['pending', 'reviewed', 'resolved'])
];

// Routes
router.post('/', optionalAuth, submitFeedbackValidation, validate, submitFeedback);
router.get('/', optionalAuth, getFeedbacksValidation, validate, getFeedbacks);
router.patch('/:id', optionalAuth, updateFeedbackValidation, validate, updateFeedbackStatus);

export default router;
