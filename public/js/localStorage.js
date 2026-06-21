// ==========================================
// DETALHES.JS — carrega dados do filme
// Suporta:
//   ?id=123         (ID numérico do banco)
//   ?id=breakingbad (slug para Hero Carousel)
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const movieId   = urlParams.get('id');

let filme = null;

// Mapeamento slug → dados locais (para filmes do Hero Carousel)
const HERO_SLUGS = {
    breakingbad: {
        titulo: 'Breaking Bad',
        genero: 'Drama',
        tipo: 'Série',
        ano: '2008',
        nota: '9.5',
        sinopse: 'Um professor de química do ensino médio diagnosticado com câncer terminal se une a um ex-aluno para fabricar e vender metanfetamina, transformando-se gradualmente em um criminoso implacável.',
        poster_url: 'assets/posters/breakingbad.jpg'
    },
    friends: {
        titulo: 'Friends',
        genero: 'Comédia',
        tipo: 'Série',
        ano: '1994',
        nota: '8.9',
        sinopse: 'Seis amigos inseparáveis — Ross, Rachel, Monica, Chandler, Joey e Phoebe — navigam juntos pelos altos e baixos da vida, do amor e da amizade nas ruas de Manhattan ao longo de dez anos inesquecíveis.',
        poster_url: 'assets/posters/friends.jpg'
    },
    arcane: {
        titulo: 'Arcane',
        genero: 'Animação / Ação',
        tipo: 'Série',
        ano: '2021',
        nota: '9.0',
        sinopse: 'Ambientada nas cidades gêmeas de Piltover e Zaun, a série explora as origens de duas icônicas campeãs e a tensão entre mundos opostos, onde magia e tecnologia colidem de forma devastadora.',
        poster_url: 'assets/posters/arcane.jpg'
    },
    dark: {
        titulo: 'Dark',
        genero: 'Drama / Ficção Científica',
        tipo: 'Série',
        ano: '2017',
        nota: '8.8',
        sinopse: 'O desaparecimento de dois filhos expõe décadas de segredos sombrios e um mistério de viagem no tempo que conecta quatro famílias de uma pequena cidade alemã através de diferentes épocas.',
        poster_url: 'assets/posters/Dark.jpg'
    }
};

async function initDetalhes() {
    // 1. Tenta slug hero (ex: ?id=breakingbad)
    if (movieId && HERO_SLUGS[movieId.toLowerCase()]) {
        filme = { ...HERO_SLUGS[movieId.toLowerCase()], id: movieId };
        renderDetalhes();
        // Tenta também enriquecer com dados do banco
        await enriquecerComBanco(HERO_SLUGS[movieId.toLowerCase()].titulo);
        return;
    }

    // 2. Tenta ID numérico via API
    if (movieId && !isNaN(parseInt(movieId))) {
        try {
            const response = await fetch(`/api/titulos/${movieId}`);
            if (response.ok) {
                filme = await response.json();
                renderDetalhes();
                return;
            }
        } catch (error) {
            console.error('Erro ao buscar filme por ID:', error);
        }
    }

    // 3. Fallback: localStorage (filmeSelecionado)
    const salvo = localStorage.getItem('filmeSelecionado');
    if (salvo) {
        try { filme = JSON.parse(salvo); } catch(e) {}
    }

    if (filme) {
        renderDetalhes();
    } else {
        mostrarErro();
    }
}

async function enriquecerComBanco(titulo) {
    // Tenta pegar dados mais completos (como ID numérico real) do banco
    try {
        const resp = await fetch('/api/titulos');
        if (!resp.ok) return;
        const filmes = await resp.json();
        const match = filmes.find(f =>
            f.titulo.toLowerCase().replace(/\s+/g,'') === titulo.toLowerCase().replace(/\s+/g,'')
        );
        if (match) {
            // Mescla preservando o poster local se o banco não tiver
            filme = {
                ...filme,
                id: match.id,
                poster_url: match.poster_url || filme.poster_url,
                sinopse: match.sinopse || filme.sinopse,
                genero: match.genero || filme.genero
            };
            renderDetalhes(); // re-render com dados atualizados
        }
    } catch(e) {
        // silencioso — dados locais já suficientes
    }
}

function renderDetalhes() {
    if (!filme) return;

    // Poster
    const posterImg = document.getElementById('moviePoster');
    if (posterImg) {
        const src = filme.poster_url || filme.poster || '';
        posterImg.src = src;
        posterImg.alt = filme.titulo || 'Poster';
        posterImg.onerror = function() {
            // Tenta fallback sem pasta se o caminho falhar
            if (!this.src.includes('default.jpg')) {
                this.src = 'assets/posters/default.jpg';
            } else {
                this.style.display = 'none';
            }
        };
    }

    // Badge de nota
    const badgeEl = document.getElementById('detailsBadge');
    if (badgeEl && filme.nota) {
        badgeEl.innerHTML = `<i class="bi bi-star-fill"></i> ${filme.nota}`;
    }

    // Campos de texto
    setText('movieTitle',       filme.titulo);
    setText('movieGenre',       capitalize(filme.genero));
    setText('movieType',        capitalize(filme.tipo));
    setText('movieYear',        filme.ano);
    setText('movieDescription', filme.sinopse || filme.descricao || 'Sinopse não disponível.');

    // Rating com ícone
    const ratingEl = document.getElementById('movieRating');
    if (ratingEl) {
        ratingEl.innerHTML = `<i class="bi bi-star-fill" style="color:#f5c518"></i> ${filme.nota || 'N/A'}`;
    }

    // Título da página
    if (filme.titulo) {
        document.title = `${filme.titulo} | 4Frames`;
    }
}

function mostrarErro() {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                    min-height:60vh;gap:16px;color:#888;text-align:center;padding:40px">
            <i class="bi bi-film" style="font-size:3rem;color:#ff335c;opacity:.5"></i>
            <h2 style="color:#fff;font-size:1.5rem;">Filme não encontrado</h2>
            <p>Não foi possível carregar as informações deste título.</p>
            <button onclick="history.back()" class="secondary"
                    style="margin-top:8px;padding:12px 28px;border-radius:30px;cursor:pointer;
                           background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);
                           color:#fff;font-family:inherit;font-size:.9rem;">
                ← Voltar
            </button>
        </div>`;
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

initDetalhes();

// ========================
// ADICIONAR À WATCHLIST
// ========================
const addButton = document.getElementById('addButton');

if (addButton) {
    addButton.addEventListener('click', async () => {
        if (!filme) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Faça login primeiro!');
            window.location.href = 'login.html';
            return;
        }

        // Se não temos ID numérico, tenta resolver via API
        let titulo_id = isNaN(parseInt(filme.id)) ? null : parseInt(filme.id);

        if (!titulo_id) {
            try {
                const resp = await fetch('/api/titulos');
                if (resp.ok) {
                    const filmes = await resp.json();
                    const match  = filmes.find(f =>
                        f.titulo.toLowerCase().replace(/\s+/g,'') === (filme.titulo || '').toLowerCase().replace(/\s+/g,'')
                    );
                    if (match) titulo_id = match.id;
                }
            } catch(e) {}
        }

        if (!titulo_id) {
            alert('Não foi possível identificar o filme. Tente novamente.');
            return;
        }

        try {
            const response = await fetch('/api/watchlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    titulo_id,
                    status: 'quero_ver'
                })
            });

            if (response.ok) {
                alert(`${filme.titulo} adicionado à sua lista!`);
            } else if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            } else {
                const data = await response.json();
                alert(data.erro || 'Erro ao adicionar. Tente novamente.');
            }
        } catch (erro) {
            alert('Erro de conexão. Verifique se o servidor está rodando.');
        }
    });
}