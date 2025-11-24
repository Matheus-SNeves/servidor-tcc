const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (req, res, next) => {
    try {
        const { email, senha } = req.body;

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        const isValid = await bcrypt.compare(senha, usuario.senha);
        if (!isValid) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        const secret = process.env.JWT_SECRET || 'secret';
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, role: usuario.role },
            secret,
            { expiresIn: '1d' }
        );

        // Remover a senha do retorno
        const { senha: _, ...usuarioSemSenha } = usuario;

        res.json({ token, user: usuarioSemSenha });
    } catch (error) {
        next(error);
    }
};

module.exports = { login };