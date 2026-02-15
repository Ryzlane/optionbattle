import express from 'express';
import { body } from 'express-validator';
import {
  getBattles,
  getBattle,
  createBattle,
  updateBattle,
  deleteBattle,
  getChampion
} from '../controllers/battle.controller.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';
import fighterRoutes from './fighter.routes.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// Validation rules
const createBattleValidation = [
  body('title')
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
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Statut invalide')
];

const updateBattleValidation = [
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
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Statut invalide')
];

// Routes battles
router.get('/', getBattles);
router.get('/:id', getBattle);
router.post('/', createBattleValidation, validate, createBattle);
router.put('/:id', updateBattleValidation, validate, updateBattle);
router.delete('/:id', deleteBattle);
router.get('/:id/champion', getChampion);

// Routes fighters imbriquées
router.use('/:battleId/fighters', fighterRoutes);

export default router;
