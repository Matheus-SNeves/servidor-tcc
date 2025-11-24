const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Alterado de 'import' para 'require'

const prisma = new PrismaClient();

// Dados Mockados do Frontend (Adaptados para o Seed)
const HORTIFRUTI_DB = [
  { n: 'Maçã Fuji', p: 12.90, w: '1kg', i: '1560806887-1e4cd0b6cbd6' },
  { n: 'Banana Prata', p: 8.99, w: '1kg', i: '1571771896395-52e242c50dc2' },
  { n: 'Abacaxi Pérola', p: 9.90, w: 'un', i: '1550258987-190a2d41a8ba' },
  { n: 'Alface Americana', p: 4.50, w: 'un', i: '1622206151226-18ca2c958a2f' },
  { n: 'Tomate Italiano', p: 14.90, w: '1kg', i: '1592924357228-91a4daadcfea' },
];

const BAKERY_DB = [
  { n: 'Pão Francês', p: 18.90, w: 'kg', i: '1534620808146-d33bb39128b2' },
  { n: 'Baguete Rústica', p: 8.90, w: 'un', i: '1509440159596-0249088772ff' },
  { n: 'Croissant Manteiga', p: 12.50, w: 'un', i: '1555507036-ab1f4038808a' },
];

const MEAT_DB = [
  { n: 'Filé Mignon', p: 89.90, w: 'kg', i: '1607623814075-e51df1bdc82f' },
  { n: 'Picanha Angus', p: 129.90, w: 'kg', i: '1594041680534-e8c8cdebd659' },
];

const DRINKS_DB = [
  { n: 'Cerveja Heineken', p: 6.49, w: '350ml', i: '1566633806327-68e152aaf26d' },
  { n: 'Coca-Cola', p: 9.99, w: '2L', i: '1622483767028-3f66f32aef97' },
];

// Mapeamento dos Mercados do Frontend para a Tabela Empresa
const MARKETS = [
    { name: 'Hortifruti da Maria', type: 'Hortifruti', imageId: '1542838132-92c53300491e', products: HORTIFRUTI_DB, cnpj: '11.111.111/0001-01' },
    { name: 'Padaria Pão Dourado', type: 'Padaria', imageId: '1517433670267-08bbd4be890f', products: BAKERY_DB, cnpj: '22.222.222/0001-02' },
    { name: 'Boi Bravo Carnes', type: 'Açougue', imageId: '1607623814075-e51df1bdc82f', products: MEAT_DB, cnpj: '33.333.333/0001-03' },
    { name: 'Adega 24h', type: 'Bebidas', imageId: '1538481199705-a958718a5156', products: DRINKS_DB, cnpj: '44.444.444/0001-04' },
];

const getImg = (id) => `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&q=80`;
const getCover = (id) => `https://images.unsplash.com/photo-${id}?w=1200&h=400&fit=crop&q=80`;

async function main() {
  console.log('🌱 Iniciando Seed do Speed Market...');

  // 1. Criar Usuário Demo
  const passwordHash = await bcrypt.hash('123456', 10);
  const user = await prisma.usuario.upsert({
    where: { email: 'demo@speedmarket.com' },
    update: {},
    create: {
      nome: 'Usuário Demo',
      email: 'demo@speedmarket.com',
      senha: passwordHash,
      telefone: '(11) 99999-9999',
      role: 'CLIENTE',
      enderecos: {
        create: {
            cep: "01310-100",
            logradouro: "Av. Paulista",
            numero: "1000",
            complemento: "Apto 45",
            bairro: "Bela Vista",
            cidade: "São Paulo",
            estado: "SP",
            apelido: "Trabalho"
        }
      }
    },
  });
  console.log(`👤 Usuário criado: ${user.nome}`);

  // 2. Criar Empresas e Produtos
  for (const mkt of MARKETS) {
    const empresa = await prisma.empresa.upsert({
        where: { cnpj: mkt.cnpj },
        update: {},
        create: {
            nome: mkt.name,
            cnpj: mkt.cnpj,
            email: `contato@${mkt.name.toLowerCase().replace(/\s/g, '')}.com`,
            imagemUrl: getImg(mkt.imageId),
            capaUrl: getCover(mkt.imageId),
            // O campo 'categorias' está sendo preenchido com um array, que o Prisma irá mapear para o tipo JSON no MySQL
            categorias: [mkt.type, 'Ofertas'], 
            tempoEntrega: "30-45 min",
            frete: 5.99,
            produtos: {
                create: mkt.products.map(p => ({
                    nome: p.n,
                    preco: Number(p.p),
                    descricao: `Delicioso ${p.n} fresquinho.`,
                    categoria: mkt.type,
                    imagemUrl: getImg(p.i),
                    peso: p.w,
                    quantidade: 100 // Estoque inicial
                }))
            }
        }
    });
    console.log(`🏪 Empresa criada: ${empresa.nome}`);
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// A chave '}' extra foi removida daqui!