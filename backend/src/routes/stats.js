import { Router } from 'express';
import { getMonthlyHistory } from '../controllers/statsController.js';

const router = Router();

router.get('/monthly-evolution', getMonthlyHistory);

export default router;