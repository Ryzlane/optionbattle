import express from 'express';
import { getMyBadges, getAllBadges, checkBadges } from '../controllers/badge.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

router.get('/my', getMyBadges);
router.get('/all', getAllBadges);
router.post('/check', checkBadges);

export default router;
