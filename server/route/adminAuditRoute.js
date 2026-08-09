import express from 'express';
import { getAudits } from '../controllers/adminAuditController.js';
import { auth } from '../middleware/auth.js';
import { Admin } from '../middleware/Admin.js';

const router = express.Router();
router.get('/', auth, Admin, getAudits);

export default router;