import { Router } from 'express';
import { postSubscription } from '../controllers/subscriptionsController.js';

const router = Router();

// POST /subscriptions  ->  cria uma assinatura nova
router.post('/', postSubscription);

export default router;
