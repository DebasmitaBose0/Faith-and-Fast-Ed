import express from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/Admin.js';
import {
  triggerBackup,
  getBackupsList,
} from '../controllers/backupController.js';

const backupRouter = express.Router();

backupRouter.post('/trigger', auth, admin, triggerBackup);
backupRouter.get('/list', auth, admin, getBackupsList);

export default backupRouter;
