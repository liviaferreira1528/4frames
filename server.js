const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '4frames_secret_key_troque_isso';

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================================

function autenticar(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ erro: 'Token inválido ou expirado' });
        }
        req.usuarioId = decoded.id;
        next();
    });
}

// ==========================================
// TESTAR CONEXÃO COM O BANCO
// ==========================================

async function conectarBanco() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado ao banco de dados MySQL!');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        return false;
    }
}

conectarBanco();

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        await pool.execute(
            'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, hash]
        );
        res.json({ mensagem: 'Cadastro realizado com sucesso!' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }
        console.error(err);
        res.status(500).json({ erro: 'Erro ao cadastrar' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos' });
    }

    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ erro: 'Email ou senha incorretos' });
        }

        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Email ou senha incorretos' });
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome, email: usuario.email }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            token,
            usuario: { 
                id: usuario.id, 
                nome: usuario.nome, 
                email: usuario.email 
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro interno' });
    }
});

// ==========================================
// ROTAS DOS TÍTULOS
// ==========================================

app.get('/api/titulos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM titulos ORDER BY titulo');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar títulos' });
    }
});

app.get('/api/titulos/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM titulos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Título não encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar título' });
    }
});

app.get('/api/titulos/filtro', async (req, res) => {
    const { tipo, genero, nota_min, nota_max, busca } = req.query;
    
    let query = 'SELECT * FROM titulos WHERE 1=1';
    const params = [];

    if (tipo && tipo !== 'todos') {
        query += ' AND tipo = ?';
        params.push(tipo === 'filme' ? 'Filme' : 'Serie');
    }

    if (genero && genero !== 'todos') {
        query += ' AND genero = ?';
        params.push(genero);
    }

    if (nota_min) {
        query += ' AND nota >= ?';
        params.push(parseFloat(nota_min));
    }

    if (nota_max) {
        query += ' AND nota <= ?';
        params.push(parseFloat(nota_max));
    }

    if (busca) {
        query += ' AND titulo LIKE ?';
        params.push(`%${busca}%`);
    }

    query += ' ORDER BY titulo';

    try {
        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar títulos' });
    }
});

// ==========================================
// ROTAS DA WATCHLIST
// ==========================================

app.get('/api/watchlist', autenticar, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT w.id, w.status, w.favoritado, w.avaliacao, w.adicionado_em,
                   t.id as titulo_id, t.titulo, t.tipo, t.poster_url, t.ano, t.nota, t.genero, t.sinopse
            FROM watchlist w
            JOIN titulos t ON w.titulo_id = t.id
            WHERE w.usuario_id = ?
            ORDER BY w.adicionado_em DESC
        `, [req.usuarioId]);
        
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar watchlist' });
    }
});

app.post('/api/watchlist', autenticar, async (req, res) => {
    let { titulo_id, tmdb_id, status } = req.body;

    if (!titulo_id && !tmdb_id) {
        return res.status(400).json({ erro: 'ID do título é obrigatório' });
    }

    try {
        if (!titulo_id && tmdb_id) {
            const [rows] = await pool.execute('SELECT id FROM titulos WHERE tmdb_id = ?', [tmdb_id]);
            if (rows.length === 0) {
                return res.status(404).json({ erro: 'Título não encontrado no banco' });
            }
            titulo_id = rows[0].id;
        }

        const [exists] = await pool.execute(
            'SELECT id FROM watchlist WHERE usuario_id = ? AND titulo_id = ?',
            [req.usuarioId, titulo_id]
        );

        if (exists.length > 0) {
            return res.status(400).json({ erro: 'Título já está na sua lista' });
        }

        await pool.execute(
            'INSERT INTO watchlist (usuario_id, titulo_id, status) VALUES (?, ?, ?)',
            [req.usuarioId, titulo_id, status || 'quero_ver']
        );

        res.json({ mensagem: 'Adicionado à watchlist com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao adicionar à watchlist' });
    }
});

// ==========================================
// ROTA ATUALIZAR STATUS (CORRIGIDA)
// ==========================================

app.put('/api/watchlist/:id', autenticar, async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        return res.status(400).json({ erro: 'Status é obrigatório' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE watchlist SET status = ? WHERE id = ? AND usuario_id = ?',
            [status, id, req.usuarioId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Item não encontrado' });
        }
        
        res.json({ mensagem: 'Status atualizado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao atualizar status' });
    }
});

// ==========================================
// ROTA REMOVER DA WATCHLIST
// ==========================================

app.delete('/api/watchlist/:id', autenticar, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute(
            'DELETE FROM watchlist WHERE id = ? AND usuario_id = ?', 
            [id, req.usuarioId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Item não encontrado' });
        }
        
        res.json({ mensagem: 'Removido da watchlist!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao remover' });
    }
});

// ==========================================
// ROTA POPULAR FILMES
// ==========================================

app.post('/api/popular', async (req, res) => {
    const filmes = req.body;
    
    if (!Array.isArray(filmes) || filmes.length === 0) {
        return res.status(400).json({ erro: 'Envie um array de filmes' });
    }

    try {
        let importados = 0;
        for (const filme of filmes) {
            const [existe] = await pool.execute(
                'SELECT id FROM titulos WHERE tmdb_id = ?',
                [filme.id]
            );

            if (existe.length > 0) continue;

            await pool.execute(
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
        }
        res.json({ mensagem: `${importados} títulos importados com sucesso!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao importar títulos' });
    }
});

// ==========================================
// ROTA IMPORTAR FILMES DO JSON (disparar uma vez)
// ==========================================

const fs = require('fs');

app.get('/api/importar', async (req, res) => {
    const jsonPath = path.join(__dirname, 'watchlist', 'data', 'filmes.json');
    if (!fs.existsSync(jsonPath)) {
        return res.status(404).json({ erro: 'Arquivo filmes.json não encontrado' });
    }
    try {
        const filmes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        let importados = 0;
        for (const filme of filmes) {
            const [existe] = await pool.execute('SELECT id FROM titulos WHERE tmdb_id = ?', [filme.id]);
            if (existe.length > 0) continue;
            await pool.execute(
                `INSERT INTO titulos (tmdb_id, titulo, tipo, genero, nota, ano, sinopse, poster_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [filme.id, filme.titulo || 'Título', filme.tipo || 'Filme', filme.genero || 'Não informado',
                 parseFloat(filme.nota) || 0, filme.ano || '2000', filme.descricao || '', filme.poster || 'assets/posters/default.jpg']
            );
            importados++;
        }
        res.json({ mensagem: `${importados} títulos importados de ${filmes.length}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao importar' });
    }
});

// ==========================================
// ROTAS DE PÁGINAS
// ==========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ==========================================
// INICIAR O SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log('\n📋 ROTAS DISPONÍVEIS:');
    console.log('   POST   /api/cadastro');
    console.log('   POST   /api/login');
    console.log('   GET    /api/titulos');
    console.log('   GET    /api/titulos/filtro');
    console.log('   GET    /api/titulos/:id');
    console.log('   GET    /api/watchlist (requer token)');
    console.log('   POST   /api/watchlist (requer token)');
    console.log('   PUT    /api/watchlist/:id (requer token)');
    console.log('   DELETE /api/watchlist/:id (requer token)');
    console.log('   POST   /api/popular (importar filmes)\n');
});