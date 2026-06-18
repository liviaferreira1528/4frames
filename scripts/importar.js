const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURAÇÃO DO BANCO
// ==========================================

const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '13978b',
    database: process.env.MYSQL_DATABASE || '4frames',
    port: process.env.MYSQL_PORT || 3306
};

// ==========================================
// FUNÇÃO PARA CARREGAR FILMES DO JSON
// ==========================================

async function carregarFilmes() {
    const jsonPath = path.join(__dirname, '..', 'watchlist', 'data', 'filmes.json');

    if (!fs.existsSync(jsonPath)) {
        console.error('❌ Arquivo filmes.json não encontrado em:', jsonPath);
        return [];
    }

    const conteudo = fs.readFileSync(jsonPath, 'utf8');

    try {
        const filmes = JSON.parse(conteudo);
        console.log(`📚 Encontrados ${filmes.length} filmes no filmes.json`);
        return filmes;
    } catch (e) {
        console.error('❌ Erro ao parsear o JSON:', e.message);
        return [];
    }
}

// ==========================================
// FUNÇÃO PARA VERIFICAR E CORRIGIR A TABELA
// ==========================================

async function verificarTabela(connection) {
    try {
        const [columns] = await connection.execute('SHOW COLUMNS FROM titulos');
        const nomesColunas = columns.map(c => c.Field);

        console.log('📋 Colunas da tabela titulos:', nomesColunas.join(', '));

        if (!nomesColunas.includes('titulo') && nomesColunas.includes('nome')) {
            console.log('🔄 Renomeando coluna "nome" para "titulo"...');
            await connection.execute('ALTER TABLE titulos CHANGE COLUMN nome titulo VARCHAR(200) NOT NULL');
            console.log('✅ Coluna renomeada com sucesso!');
        }

        return true;
    } catch (err) {
        console.error('❌ Erro ao verificar tabela:', err.message);
        return false;
    }
}

// ==========================================
// FUNÇÃO PARA IMPORTAR OS FILMES
// ==========================================

async function importarFilmes() {
    console.log('🚀 Iniciando importação...\n');

    const filmes = await carregarFilmes();

    if (filmes.length === 0) {
        console.log('❌ Nenhum filme encontrado.');
        return;
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
        await verificarTabela(connection);

        console.log(`\n📥 Importando ${filmes.length} títulos...\n`);

        let importados = 0;
        let erros = 0;

        for (const filme of filmes) {
            try {
                const [existe] = await connection.execute(
                    'SELECT id FROM titulos WHERE tmdb_id = ?',
                    [filme.id]
                );

                if (existe.length > 0) {
                    console.log(`⏭️ ${filme.titulo} já existe`);
                    continue;
                }

                await connection.execute(
                    `INSERT INTO titulos (tmdb_id, titulo, tipo, genero, nota, ano, sinopse, poster_url) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        filme.id,
                        filme.titulo || 'Título não informado',
                        filme.tipo || 'Filme',
                        filme.genero || 'Não informado',
                        parseFloat(filme.nota) || 0,
                        filme.ano || '2000',
                        filme.descricao || 'Sinopse não disponível',
                        filme.poster || 'assets/posters/default.jpg'
                    ]
                );
                importados++;
                console.log(`✅ ${importados} - ${filme.titulo}`);
            } catch (err) {
                erros++;
                console.log(`❌ Erro ao importar ${filme.titulo}: ${err.message}`);
            }
        }

        console.log('\n=========================================');
        console.log(`🎉 IMPORTADOS: ${importados}`);
        console.log(`⚠️ ERROS: ${erros}`);
        console.log(`📊 TOTAL: ${filmes.length}`);
        console.log('=========================================');

    } catch (err) {
        console.error('❌ Erro na importação:', err.message);
    } finally {
        await connection.end();
    }
}

importarFilmes();
