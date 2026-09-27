import { Router } from 'express';
import {
  getGastosPorCategoria,
  getMonthlyHistory,
} from '../controllers/statsController.js';

const router = Router();

router.get('/monthly-evolution', getMonthlyHistory);
router.get('/by-category', getGastosPorCategoria);

export default router;
