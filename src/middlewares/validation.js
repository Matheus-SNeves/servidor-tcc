const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required(),
});

const cadastroSchema = Joi.object({
    nome: Joi.string().required(),
    cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
    telefone: Joi.string().required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(6).required(),
    id_empresa: Joi.number().optional(),
    id_tipo_empregado: Joi.number().optional()
});

const validateBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map((detail) => detail.message);
        return res.status(400).json({ message: 'Erros de validação', details: messages });
    }
    next();
};

module.exports = { loginSchema, cadastroSchema, validateBody };