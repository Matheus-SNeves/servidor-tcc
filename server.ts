import express from 'express';
const cors = require('cors');
import dotenv from 'dotenv';
import routes from './src/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1243;

app.use(express.json());
app.use(cors());

// Rota de documentação (simulada)
app.get('/docs', (req, res) => {
    res.json({ message: "Documentação Swagger estaria aqui (simulado)" });
});

// Usar as rotas definidas
app.use(routes);

// Middleware global de erro
app.use((err: any, req: any, res: any, next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});