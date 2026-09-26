import { validarNovaAssinatura, criarAssinatura, buscarAssinaturas } from '../services/subscriptionsService.js';

export function getSubscriptions(req, res) {
  const status = req.query.status || 'ativo';
  const assinaturas = buscarAssinaturas(status);
  res.json(assinaturas);
}

export function postSubscription(req, res) {
  const dados = req.body;

  const erros = validarNovaAssinatura(dados);

  if (erros.length > 0) {
    return res.status(400).json({ error: erros[0] });
  }

  const novaAssinatura = criarAssinatura(dados);

  res.status(201).json(novaAssinatura);
}
