import express from 'express';
import { body } from 'express-validator';
import {
  getFighters,
  getFighter,
  createFighter,
  updateFighter,
  deleteFighter
} from '../controllers/fighter.controller.js';
import { validate } from '../middleware/validation.js';
import argumentRoutes from './argument.routes.js';

const router = express.Router({ mergeParams: true });

// Validation rules
const createFighterValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du fighter doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
];

const updateFighterValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du fighter doit contenir entre 2 et 100 caractères'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'ordre doit être un entier positif')
];

// Routes fighters
router.get('/', getFighters);
router.get('/:id', getFighter);
router.post('/', createFighterValidation, validate, createFighter);
router.put('/:id', updateFighterValidation, validate, updateFighter);
router.delete('/:id', deleteFighter);

// Routes arguments imbriquées
router.use('/:fighterId/arguments', argumentRoutes);

export default router;
