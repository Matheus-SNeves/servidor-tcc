const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const genericController = require('./utils/genericController');
const { login } = require('./controllers/authController');
const EmpresaController = require('./controllers/empresaController');
const { createCliente, createAdmin } = require('./controllers/registerController');
const { validateToken } = require('./middlewares/auth');
const { validateBody, loginSchema, cadastroSchema } = require('./middlewares/validation');

const prisma = new PrismaClient();
const routes = Router();

// Controladores Genéricos
const UsuarioController = genericController(prisma.usuario);
const ProdutoController = genericController(prisma.produto);
const EnderecoController = genericController(prisma.endereco);
const TipoEmpregoController = genericController(prisma.tipoEmprego);

// Helper para criar rotas CRUD padrão
const createCRUDRoutes = (path, controller, middlewares = []) => {
    routes.post(path, middlewares, controller.create);
    routes.get(path, middlewares, controller.read);
    routes.get(`${path}/:id`, middlewares, controller.readOne);
    routes.put(`${path}/:id`, middlewares, controller.update);
    routes.delete(`${path}/:id`, middlewares, controller.remove);
};

// --- ROTAS PÚBLICAS ---
routes.get('/', (req, res) => res.json({ message: "API Speed Market Online (JS)" }));
routes.post('/login', validateBody(loginSchema), login);
routes.post('/cadastro-cliente', validateBody(cadastroSchema), createCliente);
routes.post('/cadastro-adm', validateBody(cadastroSchema), createAdmin);

// Rotas de produtos
routes.get('/produtos', ProdutoController.read);
routes.get('/produtos/:id', ProdutoController.readOne);

// Rotas de Empresas (Usando controller específico para incluir produtos)
routes.get('/empresas', EmpresaController.read);
routes.get('/empresas/:id', EmpresaController.readOne);
routes.post('/empresas', [validateToken], EmpresaController.create);

// --- ROTAS PROTEGIDAS (Requer Token) ---

// Pedidos
routes.get('/pedidos', validateToken, async (req, res) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            where: { usuarioId: req.user.id },
            include: { itens: { include: { produto: { include: { empresa: true } } } } },
            orderBy: { dataPedido: 'desc' }
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar pedidos" });
    }
});

routes.post('/pedidos', validateToken, async (req, res) => {
    try {
        const { itens, total } = req.body;
        
        if (!itens || itens.length === 0) {
            return res.status(400).json({ error: "Pedido sem itens" });
        }

        const novoPedido = await prisma.pedido.create({
            data: {
                usuarioId: req.user.id,
                valor: total,
                status: 'pending',
                itens: {
                    create: itens.map((item) => ({
                        produtoId: Number(item.id.split('-p')[1] || item.id), 
                        quantidade: item.quantity,
                        precoUnitario: item.price
                    }))
                }
            },
            include: { itens: true }
        });
        res.status(201).json(novoPedido);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar pedido" });
    }
});

// Avaliações
routes.post('/avaliacoes', validateToken, async (req, res) => {
    try {
        const { id_produto, nota, comentario } = req.body;
        const avaliacao = await prisma.avaliacao.create({
            data: {
                usuarioId: req.user.id,
                produtoId: Number(id_produto),
                nota: Number(nota),
                comentario
            }
        });
        res.status(201).json(avaliacao);
    } catch (error) {
        res.status(500).json(error);
    }
});

createCRUDRoutes('/enderecos', EnderecoController, [validateToken]);
createCRUDRoutes('/usuarios', UsuarioController, [validateToken]); 
createCRUDRoutes('/tipoempregos', TipoEmpregoController, [validateToken]);

module.exports = routes;