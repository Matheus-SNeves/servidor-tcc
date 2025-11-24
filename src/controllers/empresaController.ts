
import { Request, Response, NextFunction } from 'express';
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

export const read = async (req: any, res: any, next: NextFunction) => {
    try {
        const empresas = await prisma.empresa.findMany({
            include: { produtos: true }
        });
        res.status(200).json(empresas);
    } catch (error) {
        next(error);
    }
};

export const readOne = async (req: any, res: any, next: NextFunction) => {
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

export const create = async (req: any, res: any, next: NextFunction) => {
    try {
        const empresa = await prisma.empresa.create({ data: req.body });
        res.status(201).json(empresa);
    } catch (error) {
        next(error);
    }
};

export const update = async (req: any, res: any, next: NextFunction) => {
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

export const remove = async (req: any, res: any, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.empresa.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
