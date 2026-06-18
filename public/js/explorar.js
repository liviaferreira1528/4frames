// ==========================================
// EXPLORAR.JS - BUSCANDO FILMES DO BANCO
// ==========================================

let filmes = [];
let filmesFiltrados = [];

// ==========================================
// FUNÇÃO PARA BUSCAR FILMES DO BANCO
// ==========================================

async function carregarFilmes() {
    try {
        const response = await fetch('/api/titulos');
        if (!response.ok) throw new Error('Erro ao buscar filmes');
        
        filmes = await response.json();
        filmesFiltrados = [...filmes];
        renderizarFilmes();
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        const grid = document.getElementById('moviesGrid');
        if (grid) {
            grid.innerHTML = '<div style="text-align: center; padding: 50px; color: #888;">Erro ao carregar filmes. Verifique o servidor.</div>';
        }
    }
}

// ==========================================
// FUNÇÃO PARA RENDERIZAR FILMES (COM IMAGENS CORRIGIDAS)
// ==========================================

function renderizarFilmes() {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (!filmesFiltrados || filmesFiltrados.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 50px; color: #888;">Nenhum filme encontrado <i class="bi bi-emoji-frown-fill"></i></div>';
        return;
    }
    
    filmesFiltrados.forEach(filme => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        // CORRIGIDO: Adiciona "public/" na frente do caminho da imagem
        const posterPath = filme.poster_url ? `/${filme.poster_url}` : '/assets/posters/default.jpg';
        
        card.innerHTML = `
            <img src="${posterPath}" class="movie-poster" alt="${filme.titulo}" onerror="this.src='/assets/posters/default.jpg'">
            <div class="movie-content">
                <h3 class="movie-title">${filme.titulo}</h3>
                <div class="movie-info">
                    <span>${filme.ano || 'Ano não informado'}</span>
                    <span class="movie-rating"><i class="bi bi-star-fill"></i> ${filme.nota || '0'}</span>
                </div>
                <button class="add-btn" data-id="${filme.id}">Adicionar à lista</button>
            </div>
        `;
        
        // Abrir modal ao clicar no card
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) return;
            if (typeof abrirModalFilme === 'function') {
                abrirModalFilme(filme);
            }
        });
        
        // Adicionar à lista
        const addBtn = card.querySelector('.add-btn');
        addBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const token = localStorage.getItem('token');
            if (!token) {
                if (confirm('Faça login para adicionar filmes. Deseja ir para o login?')) {
                    window.location.href = 'login.html';
                }
                return;
            }
            
            const titulo_id = filme.id;
            
            try {
                const response = await fetch('/api/watchlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ titulo_id })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert(`${filme.titulo} adicionado à sua lista!`);
                    addBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Adicionado';
                    setTimeout(() => addBtn.textContent = 'Adicionar à lista', 2000);
                } else {
                    alert(data.erro || 'Erro ao adicionar');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao conectar com o servidor.');
            }
        });
        
        grid.appendChild(card);
    });
}

// ==========================================
// FUNÇÃO PARA APLICAR FILTROS
// ==========================================

function aplicarFiltros() {
    const categoriaAtiva = document.querySelector('.filter-btn-cat.active');
    const categoria = categoriaAtiva ? categoriaAtiva.dataset.category : 'todos';
    
    const generoAtivo = document.querySelector('.filter-btn-gen.active');
    const genero = generoAtivo ? generoAtivo.dataset.genero : 'todos';
    
    const notaAtiva = document.querySelector('.filter-btn-nota.active');
    const notaFiltro = notaAtiva ? notaAtiva.dataset.nota : 'todas';
    
    let resultado = [...filmes];
    
    // Filtro por categoria (tipo)
    if (categoria !== 'todos') {
        resultado = resultado.filter(f => f.tipo === (categoria === 'filme' ? 'Filme' : 'Serie'));
    }
    
    // Filtro por gênero
    if (genero !== 'todos') {
        resultado = resultado.filter(f => f.genero && f.genero.toLowerCase() === genero);
    }
    
    // Filtro por nota
    if (notaFiltro !== 'todas') {
        switch(notaFiltro) {
            case '9+': resultado = resultado.filter(f => parseFloat(f.nota) >= 9); break;
            case '8-9': resultado = resultado.filter(f => parseFloat(f.nota) >= 8 && parseFloat(f.nota) < 9); break;
            case '7-8': resultado = resultado.filter(f => parseFloat(f.nota) >= 7 && parseFloat(f.nota) < 8); break;
            case '6-7': resultado = resultado.filter(f => parseFloat(f.nota) >= 6 && parseFloat(f.nota) < 7); break;
            case 'menos6': resultado = resultado.filter(f => parseFloat(f.nota) < 6); break;
        }
    }
    
    filmesFiltrados = resultado;
    renderizarFilmes();
}

// ==========================================
// EVENTO DE BUSCA
// ==========================================

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const busca = e.target.value.toLowerCase();
        filmesFiltrados = filmes.filter(f => f.titulo && f.titulo.toLowerCase().includes(busca));
        renderizarFilmes();
    });
}

// ==========================================
// EVENTOS DOS FILTROS
// ==========================================

document.querySelectorAll('.filter-btn-cat').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn-cat').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        aplicarFiltros();
    });
});

document.querySelectorAll('.filter-btn-gen').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn-gen').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        aplicarFiltros();
    });
});

document.querySelectorAll('.filter-btn-nota').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn-nota').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        aplicarFiltros();
    });
});

// ==========================================
// CARREGAR FILMES AO INICIAR
// ==========================================

carregarFilmes();