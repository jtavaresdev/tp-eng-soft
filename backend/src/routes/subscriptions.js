import { Router } from 'express';
import {
  deleteSubscription,
  getSubscriptions,
  postSubscription,
  putSubscription,
  getSummary,
  getUpcomingCharges,
} from '../controllers/subscriptionsController.js';

const router = Router();

router.post('/', postSubscription);
router.get('/', getSubscriptions);
router.get('/summary', getSummary);
router.get('/upcoming-charges', getUpcomingCharges);
router.put('/:id', putSubscription);
router.delete('/:id', deleteSubscription);
router.patch('/:id/cancel', deleteSubscription);

export default router;
