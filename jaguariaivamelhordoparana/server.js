import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import initializeDatabase from "./database.js"; // Importa a função assíncrona

const app = express();
const PORT = 6000;

// Variável global para armazenar a conexão do banco
let db;

// Inicializa a conexão com o banco de dados e inicia o servidor
async function startServer() {
    try {
        db = await initializeDatabase(); // ESPERA a conexão ser estabelecida!

        // Caminhos absolutos
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Middlewares
        app.use(cors());
        app.use(express.json());

        // Servir arquivos estáticos
        app.use(express.static(__dirname));

        // Rota principal → envia o index.html
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "index.html"));
        });

        // Rota para inserir história (POST)
        app.post("/historias", (req, res) => {
            const { nome, mensagem } = req.body;

            if (!nome || !mensagem) {
                return res.status(400).json({ error: "Campos obrigatórios ausentes." });
            }

            const query = "INSERT INTO historias (nome, mensagem) VALUES (?, ?)";

            // Usando db.run() do módulo 'sqlite' que retorna uma Promessa
            db.run(query, nome, mensagem)
                .then(result => {
                    console.log(`História inserida com sucesso.`);
                    res.status(201).json({ id: result.lastID, nome, mensagem });
                })
                .catch(err => {
                    console.error("ERRO CRÍTICO ao inserir no BD:", err.message);
                    res.status(500).json({ error: "Erro interno ao salvar no banco de dados." });
                });
        });

        // Rota para listar histórias (GET)
        app.get("/historias", (req, res) => {
            // Usando db.all() do módulo 'sqlite' que retorna uma Promessa
            db.all("SELECT * FROM historias ORDER BY id DESC")
                .then(rows => {
                    res.json(rows);
                })
                .catch(err => {
                    console.error("Erro ao buscar histórias:", err.message);
                    res.status(500).json({ error: "Erro ao buscar histórias." });
                });
        });

        // Iniciar servidor APENAS DEPOIS da conexão do banco
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Falha ao iniciar o servidor devido ao erro no BD:", error.message);
        process.exit(1); // Encerra o processo se o BD falhar
    }
}

startServer(); // Chama a função para iniciar tudo
