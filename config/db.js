const mysql = require('mysql2/promise');

// ==========================================
// CONFIGURAÇÃO DO BANCO PARA O RAILWAY
// ==========================================

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '13978b',
    database: process.env.MYSQL_DATABASE || '4frames',
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = { pool };
