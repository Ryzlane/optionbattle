import express from 'express';
import { body } from 'express-validator';
import {
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
  createShareLink,
  getShareLinks,
  deleteShareLink,
  joinViaShareLink,
  getActivities,
  leaveBattle
} from '../controllers/collaboration.controller.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Route publique pour rejoindre via lien (pas de protect)
router.post('/join/:token', protect, joinViaShareLink);

// Protection globale pour les autres routes
router.use(protect);

// Collaborators routes
router.get('/:battleId/collaborators', getCollaborators);

router.post('/:battleId/collaborators', [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalide'),
  body('role')
    .isIn(['editor', 'viewer'])
    .withMessage('Rôle invalide (editor ou viewer)')
], validate, addCollaborator);

router.patch('/:battleId/collaborators/:userId', [
  body('role')
    .isIn(['editor', 'viewer'])
    .withMessage('Rôle invalide (editor ou viewer)')
], validate, updateCollaboratorRole);

router.delete('/:battleId/collaborators/:userId', removeCollaborator);

router.post('/:battleId/leave', leaveBattle);

// Share Links routes
router.get('/:battleId/share-links', getShareLinks);

router.post('/:battleId/share-links', [
  body('role')
    .isIn(['editor', 'viewer'])
    .withMessage('Rôle invalide (editor ou viewer)'),
  body('expiresIn')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Durée invalide (jours, minimum 1)'),
  body('maxUsage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Nombre maximum d\'utilisations invalide')
], validate, createShareLink);

router.delete('/:battleId/share-links/:linkId', deleteShareLink);

// Activities route
router.get('/:battleId/activities', getActivities);

export default router;
