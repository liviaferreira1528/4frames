// ==========================================
// APP.JS - GERENCIAMENTO DE AUTENTICAÇÃO
// ==========================================

// URL DA API
const API_URL = '/api';

// ==========================================
// FUNÇÃO PARA PEGAR O TOKEN
// ==========================================

function getToken() {
    return localStorage.getItem('token');
}

// ==========================================
// FUNÇÃO PARA FAZER REQUISIÇÕES AUTENTICADAS
// ==========================================

async function requestAutenticado(url, options = {}) {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
    });
    
    return response;
}

// ==========================================
// FUNÇÃO PARA ADICIONAR À WATCHLIST
// ==========================================

async function adicionarWatchlist(titulo_id) {
    const token = getToken();
    
    if (!token) {
        alert('Você precisa estar logado para adicionar filmes!');
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const response = await requestAutenticado('/watchlist', {
            method: 'POST',
            body: JSON.stringify({ titulo_id })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Filme adicionado à sua lista!');
            return true;
        } else {
            alert(data.erro || 'Erro ao adicionar');
            return false;
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
        return false;
    }
}

// ==========================================
// FUNÇÃO PARA BUSCAR WATCHLIST DO USUÁRIO
// ==========================================

async function buscarWatchlist() {
    const token = getToken();
    
    if (!token) {
        return [];
    }
    
    try {
        const response = await requestAutenticado('/watchlist');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar watchlist:', error);
        return [];
    }
}

// ==========================================
// FUNÇÃO PARA REMOVER DA WATCHLIST
// ==========================================

async function removerWatchlist(id) {
    const token = getToken();
    
    if (!token) {
        alert('Faça login primeiro!');
        return false;
    }
    
    try {
        const response = await requestAutenticado(`/watchlist/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Filme removido da sua lista!');
            return true;
        } else {
            const data = await response.json();
            alert(data.erro || 'Erro ao remover');
            return false;
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
        return false;
    }
}

// ==========================================
// FUNÇÃO PARA ATUALIZAR STATUS DA WATCHLIST
// ==========================================

async function atualizarStatusWatchlist(id, status) {
    const token = getToken();
    
    if (!token) {
        return false;
    }
    
    try {
        const response = await requestAutenticado(`/watchlist/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Erro:', error);
        return false;
    }
}

// ==========================================
// FUNÇÃO PARA FAZER LOGIN
// ==========================================

async function fazerLogin(email, senha) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            return { success: true, usuario: data.usuario };
        } else {
            return { success: false, erro: data.erro };
        }
    } catch (error) {
        console.error('Erro:', error);
        return { success: false, erro: 'Erro ao conectar com o servidor' };
    }
}

// ==========================================
// FUNÇÃO PARA FAZER CADASTRO
// ==========================================

async function fazerCadastro(nome, email, senha) {
    try {
        const response = await fetch(`${API_URL}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, mensagem: data.mensagem };
        } else {
            return { success: false, erro: data.erro };
        }
    } catch (error) {
        console.error('Erro:', error);
        return { success: false, erro: 'Erro ao conectar com o servidor' };
    }
}

// ==========================================
// FUNÇÃO PARA FAZER LOGOUT
// ==========================================

function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// ==========================================
// FUNÇÃO PARA VERIFICAR SE ESTÁ LOGADO
// ==========================================

function estaLogado() {
    return !!getToken();
}