import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { submitFeedback, getFeedbacks } from '../controllers/feedback.controller.js';
import { optionalAuth, protect } from '../middleware/auth.js';

const router = express.Router();

const submitValidation = [
  body('pageUrl').isURL(),
  body('message').optional().isString().trim().isLength({ max: 5000 }),
  body('screenshot').optional().isString(),
  body('userAgent').optional().isString()
];

router.post('/', optionalAuth, submitValidation, validate, submitFeedback);
router.get('/', protect, getFeedbacks);

export default router;
