document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.querySelector('.search-btn');
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchOverlayInput');
    const results = document.getElementById('searchOverlayResults');
    const closeBtn = document.getElementById('searchOverlayClose');

    if (!searchBtn || !overlay) return;

    let filmes = [];

    async function carregarFilmes() {
        try {
            const response = await fetch('/api/titulos');
            if (response.ok) filmes = await response.json();
        } catch (e) { console.error('Erro ao carregar filmes para busca'); }
    }

    carregarFilmes();

    function abrirBusca() {
        overlay.classList.add('active');
        input.value = '';
        results.innerHTML = '';
        setTimeout(() => input.focus(), 100);
        document.body.style.overflow = 'hidden';
    }

    function fecharBusca() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    searchBtn.addEventListener('click', abrirBusca);
    closeBtn.addEventListener('click', fecharBusca);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharBusca();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharBusca();
    });

    input.addEventListener('input', () => {
        const busca = input.value.toLowerCase().trim();

        if (!busca) {
            results.innerHTML = '';
            return;
        }

        const filtrados = filmes.filter(f =>
            (f.titulo && f.titulo.toLowerCase().includes(busca)) ||
            (f.genero && f.genero.toLowerCase().includes(busca)) ||
            (f.tipo && f.tipo.toLowerCase().includes(busca))
        );

        if (filtrados.length === 0) {
            results.innerHTML = '<div class="search-overlay-empty">Nenhum resultado encontrado</div>';
            return;
        }

        results.innerHTML = '';
        filtrados.slice(0, 12).forEach(filme => {
            const card = document.createElement('div');
            card.className = 'search-result-card';
            const poster = filme.poster_url ? '/' + filme.poster_url.replace(/\\/g, '/') : '/assets/posters/default.jpg';
            card.innerHTML = `
                <img src="${poster}" alt="${filme.titulo}" onerror="this.src='/assets/posters/default.jpg'">
                <div class="search-result-info">
                    <h4>${filme.titulo}</h4>
                    <span>${filme.tipo || ''}${filme.nota ? ' &middot; ' + filme.nota : ''}</span>
                </div>
            `;
            card.addEventListener('click', () => {
                localStorage.setItem('filmeSelecionado', JSON.stringify(filme));
                window.location.href = 'detalhes.html';
            });
            results.appendChild(card);
        });
    });
});
