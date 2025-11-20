import sqlite3 from 'sqlite3';
import { open } from 'sqlite'; // Usaremos 'sqlite' para Promessas

// Esta função assíncrona irá abrir o banco e garantir que a tabela exista.
async function initializeDatabase() {
    try {
        // Abre a conexão com o banco de dados (cria se não existir)
        const db = await open({
            filename: 'meubanco.db',
            driver: sqlite3.Database
        });

        console.log('Conexão com o banco de dados estabelecida.');

        // Garante que a tabela exista
        await db.exec(`
            CREATE TABLE IF NOT EXISTS historias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                mensagem TEXT
            )
        `);
        console.log('Tabela "historias" verificada/criada com sucesso.');

        return db;
    } catch (err) {
        console.error('ERRO FATAL NA INICIALIZAÇÃO DO BD:', err.message);
        throw err; // Lança o erro para o servidor saber que falhou
    }
}

// Exportamos a função que inicia o banco, e não o objeto de banco diretamente.
export default initializeDatabase;
