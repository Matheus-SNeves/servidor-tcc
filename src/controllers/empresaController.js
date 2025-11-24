const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const read = async (req, res, next) => {
    try {
        const empresas = await prisma.empresa.findMany({
            include: { produtos: true }
        });
        res.status(200).json(empresas);
    } catch (error) {
        next(error);
    }
};

const readOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresa = await prisma.empresa.findUnique({
            where: { id: Number(id) },
            include: { produtos: true }
        });
        
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }
        
        res.status(200).json(empresa);
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const empresa = await prisma.empresa.create({ data: req.body });
        res.status(201).json(empresa);
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresa = await prisma.empresa.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.status(202).json(empresa);
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.empresa.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { read, readOne, create, update, remove };