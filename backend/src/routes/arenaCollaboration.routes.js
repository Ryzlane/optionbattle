import express from 'express';
import { body, param } from 'express-validator';
import {
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  leaveArena,
  getShareLinks,
  createShareLink,
  deleteShareLink,
  joinViaToken,
  getActivities,
  sendInvitation,
  acceptInvitation,
  rejectInvitation,
  getInvitations,
  cancelInvitation
} from '../controllers/arenaCollaboration.controller.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const arenaIdValidation = [
  param('arenaId').isUUID().withMessage('ID d\'arène invalide')
];

const addCollaboratorValidation = [
  ...arenaIdValidation,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('role')
    .isIn(['editor', 'viewer'])
    .withMessage('Le rôle doit être "editor" ou "viewer"')
];

const createShareLinkValidation = [
  ...arenaIdValidation,
  body('role')
    .isIn(['editor', 'viewer'])
    .withMessage('Le rôle doit être "editor" ou "viewer"'),
  body('expiresIn')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('L\'expiration doit être entre 1 et 365 jours'),
  body('maxUsage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('L\'usage maximum doit être au moins 1')
];

const joinTokenValidation = [
  param('token')
    .isLength({ min: 10, max: 10 })
    .withMessage('Token invalide')
];

const removeCollaboratorValidation = [
  ...arenaIdValidation,
  param('userId').isUUID().withMessage('ID utilisateur invalide')
];

const deleteLinkValidation = [
  ...arenaIdValidation,
  param('linkId').isUUID().withMessage('ID de lien invalide')
];

const sendInvitationValidation = [
  ...arenaIdValidation,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('role')
    .isIn(['editor', 'viewer'])
    .withMessage('Le rôle doit être "editor" ou "viewer"')
];

const invitationTokenValidation = [
  param('token')
    .isLength({ min: 10, max: 10 })
    .withMessage('Token invalide')
];

const cancelInvitationValidation = [
  ...arenaIdValidation,
  param('invitationId').isUUID().withMessage('ID d\'invitation invalide')
];

// Routes invitations (protégées)
router.post('/:arenaId/invitations', protect, sendInvitationValidation, validate, sendInvitation);
router.get('/:arenaId/invitations', protect, arenaIdValidation, validate, getInvitations);
router.delete('/:arenaId/invitations/:invitationId', protect, cancelInvitationValidation, validate, cancelInvitation);
router.post('/invitations/:token/accept', protect, invitationTokenValidation, validate, acceptInvitation);
router.post('/invitations/:token/reject', protect, invitationTokenValidation, validate, rejectInvitation);

// Routes collaborateurs (protégées sauf joinViaToken)
router.get('/:arenaId/collaborators', protect, arenaIdValidation, validate, getCollaborators);
router.post('/:arenaId/collaborators', protect, addCollaboratorValidation, validate, addCollaborator);
router.delete('/:arenaId/collaborators/:userId', protect, removeCollaboratorValidation, validate, removeCollaborator);
router.post('/:arenaId/leave', protect, arenaIdValidation, validate, leaveArena);

// Routes liens partageables (protégées sauf joinViaToken)
router.get('/:arenaId/share-links', protect, arenaIdValidation, validate, getShareLinks);
router.post('/:arenaId/share-links', protect, createShareLinkValidation, validate, createShareLink);
router.delete('/:arenaId/share-links/:linkId', protect, deleteLinkValidation, validate, deleteShareLink);

// Route publique pour rejoindre via token
router.post('/join/:token', protect, joinTokenValidation, validate, joinViaToken);

// Route activités (protégée)
router.get('/:arenaId/activities', protect, arenaIdValidation, validate, getActivities);

export default router;
