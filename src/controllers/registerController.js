const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Registrar novo Cliente
const createCliente = async (req, res, next) => {
    try {
        const { nome, cpf, telefone, email, senha } = req.body;
        
        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email já cadastrado" });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                cpf,
                telefone,
                email,
                senha: hashedPassword,
                role: 'CLIENTE',
            },
        });

        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        res.status(201).json(usuarioSemSenha);
    } catch (error) {
        next(error); 
    }
};

// Registrar Admin de Empresa
const createAdmin = async (req, res, next) => {
    try {
        const { nome, cpf, telefone, email, senha, id_empresa } = req.body; 

        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email já cadastrado" });
        }

        if (!id_empresa) {
            return res.status(400).json({ message: "O ID da empresa é obrigatório para um ADMIN." });
        }

        const empresa = await prisma.empresa.findUnique({ where: { id: id_empresa } });
        if (!empresa) {
             return res.status(404).json({ message: `Empresa com ID ${id_empresa} não encontrada.` });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                cpf,
                telefone,
                email,
                senha: hashedPassword,
                role: 'ADMIN',
                empresaId: id_empresa
            },
        });

        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        res.status(201).json(usuarioSemSenha);
    } catch (error) {
        next(error);
    }
};

module.exports = { createCliente, createAdmin };