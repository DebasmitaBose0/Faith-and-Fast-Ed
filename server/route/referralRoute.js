import express from 'express';
import { getReferrals } from '../controllers/referralController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.get('/', auth, getReferrals);

export default router;