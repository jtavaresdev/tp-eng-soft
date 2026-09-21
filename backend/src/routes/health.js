import { Router } from 'express';

const router = Router();

// GET /health -> verifica se a API está no ar
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
