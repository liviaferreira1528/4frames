const mysql = require('mysql2/promise');

function parseUrl(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        return {
            host: u.hostname,
            port: u.port || 3306,
            user: u.username,
            password: u.password,
            database: u.pathname.replace('/', '')
        };
    } catch { return null; }
}

const fromUrl = parseUrl(process.env.DATABASE_URL) || parseUrl(process.env.MYSQL_URL);

const pool = mysql.createPool({
    host: fromUrl?.host || process.env.MYSQL_HOST || 'localhost',
    port: fromUrl?.port || process.env.MYSQL_PORT || 3306,
    user: fromUrl?.user || process.env.MYSQL_USER || 'root',
    password: fromUrl?.password || process.env.MYSQL_PASSWORD || '13978b',
    database: fromUrl?.database || process.env.MYSQL_DATABASE || '4frames',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
});

async function autoMigrate() {
    try {
        const conn = await pool.getConnection();
        await conn.execute(`CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await conn.execute(`CREATE TABLE IF NOT EXISTS titulos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tmdb_id INT,
            titulo VARCHAR(200) NOT NULL,
            tipo VARCHAR(20),
            genero VARCHAR(100),
            nota DECIMAL(3,1),
            ano VARCHAR(4),
            sinopse TEXT,
            poster_url VARCHAR(500),
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        await conn.execute(`CREATE TABLE IF NOT EXISTS watchlist (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            titulo_id INT NOT NULL,
            status VARCHAR(20) DEFAULT 'quero_ver',
            favoritado TINYINT DEFAULT 0,
            avaliacao INT,
            adicionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (titulo_id) REFERENCES titulos(id) ON DELETE CASCADE,
            UNIQUE KEY unique_usuario_titulo (usuario_id, titulo_id)
        )`);
        conn.release();
        console.log('Migration executada com sucesso');
    } catch (err) {
        console.error('Erro na migration:', err.message);
    }
}

autoMigrate();

module.exports = { pool };
