import { Router } from 'express';
import { postSubscription, getSubscriptions } from '../controllers/subscriptionsController.js';

const router = Router();

// POST /subscriptions  ->  cria uma assinatura nova
router.post('/', postSubscription);
router.get('/', getSubscriptions);

export default router;
