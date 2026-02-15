import express from 'express';
import { protect } from '../middleware/auth.js';
import { getTemplates, getTemplate, useBattleTemplate } from '../controllers/template.controller.js';

const router = express.Router();

// Routes publiques (pour voir les templates)
router.get('/', protect, getTemplates);
router.get('/:id', protect, getTemplate);

// Route pour utiliser un template (créer une battle)
router.post('/:id/use', protect, useBattleTemplate);

export default router;
