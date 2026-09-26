import { Router } from 'express';
import {
  getSubscriptions,
  postSubscription,
  putSubscription,
} from '../controllers/subscriptionsController.js';

const router = Router();

router.post('/', postSubscription);
router.get('/', getSubscriptions);
router.put('/:id', putSubscription);

export default router;
