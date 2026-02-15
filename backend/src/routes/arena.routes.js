import express from 'express';
import { body } from 'express-validator';
import {
  getArenas,
  getArena,
  createArena,
  updateArena,
  deleteArena
} from '../controllers/arena.controller.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createArenaValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères')
];

const updateArenaValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères'),
  body('status')
    .optional()
    .isIn(['active', 'archived'])
    .withMessage('Le statut doit être "active" ou "archived"')
];

// Routes arenas (toutes protégées)
router.get('/', protect, getArenas);
router.get('/:id', protect, getArena);
router.post('/', protect, createArenaValidation, validate, createArena);
router.put('/:id', protect, updateArenaValidation, validate, updateArena);
router.delete('/:id', protect, deleteArena);

export default router;
