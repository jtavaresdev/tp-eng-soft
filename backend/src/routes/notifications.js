import { Router } from 'express';
import { postNotificationTestRun } from '../controllers/notificationsController.js';

const router = Router();

router.post('/test-run', postNotificationTestRun);

export default router;
