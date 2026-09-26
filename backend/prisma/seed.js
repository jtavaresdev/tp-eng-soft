import pkgClient from '@prisma/client';
import * as adapterPkg from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const { PrismaClient } = pkgClient;
const PrismaAdapter = adapterPkg.PrismaBetterSqlite3 || adapterPkg.PrismaBetterSqlite;

// Instancia a conexão passando a URL/caminho explicitamente no adapter
const adapter = new PrismaAdapter({
  url: 'file:./data/dev.db'
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Populando o banco de dados com assinaturas...');

  await prisma.subscription.deleteMany();

  const subscriptionsData = [
    {
      nome: 'Netflix Premium 4K',
      valor: 55.90,
      data_cobranca: new Date('2026-10-05'),
      categoria: 'streaming',
      status: 'ativo',
    },
    {
      nome: 'Spotify Family',
      valor: 34.90,
      data_cobranca: new Date('2026-10-12'),
      categoria: 'streaming',
      status: 'ativo',
    },
    {
      nome: 'ChatGPT Plus',
      valor: 110.00,
      data_cobranca: new Date('2026-10-01'),
      categoria: 'produtividade',
      status: 'ativo',
    },
    {
      nome: 'Academia Smart Fit',
      valor: 119.90,
      data_cobranca: new Date('2026-10-10'),
      categoria: 'academia',
      status: 'ativo',
    },
    {
      nome: 'Xbox Game Pass Ultimate',
      valor: 59.99,
      data_cobranca: new Date('2026-10-08'),
      categoria: 'jogos',
      status: 'ativo',
    }
  ];

  for (const item of subscriptionsData) {
    await prisma.subscription.create({ data: item });
  }

  console.log(`✅ Sucesso! ${subscriptionsData.length} assinaturas foram cadastradas.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular o banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });