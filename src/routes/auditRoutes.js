import express from 'express';
import * as auditController from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.get('/', protect, authorize(['Admin']), auditController.getAuditLogs);

export default router;
