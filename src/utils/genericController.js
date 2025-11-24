// Função auxiliar para lidar com relacionamentos se necessário
const transformBody = (data) => {
    const newData = {};
    for (const key in data) {
        newData[key] = data[key];
    }
    return newData;
};

const genericController = (model) => ({
    create: async (req, res, next) => {
        try {
            const data = transformBody(req.body);
            const record = await model.create({ data });
            res.status(201).json(record);
        } catch (error) {
            next(error);
        }
    },

    read: async (req, res, next) => {
        try {
            const records = await model.findMany();
            res.status(200).json(records);
        } catch (error) {
            next(error);
        }
    },

    readOne: async (req, res, next) => {
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

    update: async (req, res, next) => {
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

    remove: async (req, res, next) => {
        try {
            await model.delete({ where: { id: Number(req.params.id) } });
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
});

module.exports = genericController;