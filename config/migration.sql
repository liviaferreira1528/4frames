-- ==========================================
-- MIGRATION: 4Frames Database Schema
-- Execute no seu MySQL antes de iniciar
-- ==========================================

CREATE DATABASE IF NOT EXISTS 4frames;
USE 4frames;

-- ==========================================
-- TABELA: usuarios
-- ==========================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA: titulos
-- ==========================================

CREATE TABLE IF NOT EXISTS titulos (
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
);

-- ==========================================
-- TABELA: watchlist
-- ==========================================

CREATE TABLE IF NOT EXISTS watchlist (
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
);
