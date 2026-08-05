import express from 'express';
import { getLedger } from '../controllers/stockController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.get('/:id', auth, getLedger);

export default router;