import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Tipagem mais explícita
interface CustomRequest extends Request {
    body: {
        nome: string;
        cpf?: string;
        telefone: string;
        email: string;
        senha: string;
        id_empresa?: number; // Adicionado para createAdmin
    };
}

// ----------------------------------------------------
// Função para registrar um novo Cliente
// ----------------------------------------------------
export const createCliente = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { nome, cpf, telefone, email, senha } = req.body;
        
        // 1. Verificar se o e-mail já está cadastrado
        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email já cadastrado" });
        }

        // 2. Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 3. Criar o novo usuário
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                cpf,
                telefone,
                email,
                senha: hashedPassword,
                role: 'CLIENTE', // Define o papel como CLIENTE
            },
        });

        // 4. Retornar usuário sem a senha
        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        res.status(201).json(usuarioSemSenha);
    } catch (error) {
        // Envia o erro para o middleware global de erros
        next(error); 
    }
};

// ----------------------------------------------------
// Função para registrar um novo Admin de Empresa
// ----------------------------------------------------
export const createAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        // Renomeado id_empresa para empresaId para consistência com o Schema
        const { nome, cpf, telefone, email, senha, id_empresa } = req.body; 

        // 1. Verificar se o e-mail já está cadastrado
        const existing = await prisma.usuario.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email já cadastrado" });
        }

        // 2. Verificar se a empresa existe
        if (!id_empresa) {
            return res.status(400).json({ message: "O ID da empresa é obrigatório para um ADMIN." });
        }

        const empresa = await prisma.empresa.findUnique({ where: { id: id_empresa } });
        if (!empresa) {
             return res.status(404).json({ message: `Empresa com ID ${id_empresa} não encontrada.` });
        }

        // 3. Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 4. Criar o novo usuário
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                cpf,
                telefone,
                email,
                senha: hashedPassword,
                role: 'ADMIN', // Define o papel como ADMIN
                empresaId: id_empresa // Vincula ao ID da empresa
            },
        });

        // 5. Retornar usuário sem a senha
        const { senha: _, ...usuarioSemSenha } = novoUsuario;
        res.status(201).json(usuarioSemSenha);
    } catch (error) {
        next(error);
    }
};  