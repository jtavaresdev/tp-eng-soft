import { prisma } from '../lib/prisma.js';

const STATUS_ATIVO = 'ativo';

export async function getResumoAssinaturasAtivas() {
  const resultado = await prisma.subscription.aggregate({
    where: { status: STATUS_ATIVO },
    _sum: { valor: true },
    _count: { _all: true },
  });

  return {
    somaValor: resultado._sum.valor, // Decimal | null quando não há registros
    quantidade: resultado._count._all,
  };
}