import { Request, Response, NextFunction } from 'express';

// Função auxiliar para lidar com chaves estrangeiras que vêm como "id_algo" do frontend
// O Prisma espera relacionamentos via `connect` ou nomes de campos camelCase mapeados.
const transformBody = (data: any) => {
    const newData: any = {};
    for (const key in data) {
        // Se o campo for id_algo, tentamos mapear para o prisma field correto se necessário
        // Mas como usamos @map no schema, o Prisma deve aceitar os campos mapeados se a tipagem permitir.
        // Porem, para criar relacionamentos "vivos" (nested writes), as vezes precisamos de connect.
        // Neste Generic simplificado, assumimos que o Prisma Client resolve os @map definidos no schema.
        newData[key] = data[key];
    }
    return newData;
};

const genericController = (model: any) => ({
    create: async (req: any, res: any, next: NextFunction) => {
        try {
            const data = transformBody(req.body);
            const record = await model.create({ data });
            res.status(201).json(record);
        } catch (error) {
            next(error);
        }
    },

    read: async (req: any, res: any, next: NextFunction) => {
        try {
            const records = await model.findMany();
            res.status(200).json(records);
        } catch (error) {
            next(error);
        }
    },

    readOne: async (req: any, res: any, next: NextFunction) => {
        try {
            const record = await model.findUnique({ where: { id: Number(req.params.id) } });
            if (!record) {
                return res.status(404).json({ error: 'Registro não encontrado.' });
            }
            res.status(200).json(record);
        } catch (error) {
            next(error);
        }
    },

    update: async (req: any, res: any, next: NextFunction) => {
        try {
            const record = await model.update({
                where: { id: Number(req.params.id) },
                data: req.body,
            });
            res.status(202).json(record);
        } catch (error) {
            next(error);
        }
    },

    remove: async (req: any, res: any, next: NextFunction) => {
        try {
            await model.delete({ where: { id: Number(req.params.id) } });
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
});

export default genericController;