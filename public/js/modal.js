function criarModal() {
    if (document.getElementById('filmeModal')) return;
    
    const modalHTML = `
        <div id="filmeModal" class="filme-modal">
            <div class="filme-modal-content">
                <div class="filme-modal-header">
                    <h3 id="modalTitulo">Título</h3>
                    <button class="filme-modal-close" onclick="fecharModalFilme()"><i class="bi bi-x-lg"></i></button>
                </div>
                <div class="filme-modal-body">
                    <p><strong><i class="bi bi-camera-reels-fill"></i> Gênero:</strong> <span id="modalGenero">-</span></p>
                    <p><strong><i class="bi bi-calendar3"></i> Ano:</strong> <span id="modalAno">-</span></p>
                    <p><strong><i class="bi bi-star-fill"></i> Nota:</strong> <span id="modalNota">-</span></p>
                    <p id="modalSinopse" style="margin-top: 15px; line-height: 1.6;"></p>
                    <div class="modal-trailer-container" id="modalTrailerContainer" style="margin-top: 20px; display: none;">
                        <iframe id="modalTrailer" width="100%" height="200" frameborder="0" allowfullscreen></iframe>
                    </div>
                </div>
                <div class="filme-modal-footer">
                    <button id="modalTrailerBtn" class="modal-trailer-btn"><i class="bi bi-camera-reels-fill"></i> Ver Trailer</button>
                    <button id="modalAddListaBtn" class="modal-add-btn"><i class="bi bi-plus-lg"></i> Adicionar à Minha Lista</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('filmeModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('filmeModal')) fecharModalFilme();
    });
    
    document.getElementById('modalTrailerBtn').addEventListener('click', () => {
        const container = document.getElementById('modalTrailerContainer');
        if (container.style.display === 'none' || !container.style.display) {
            container.style.display = 'block';
            document.getElementById('modalTrailerBtn').innerHTML = '<i class="bi bi-camera-reels-fill"></i> Fechar Trailer';
        } else {
            container.style.display = 'none';
            document.getElementById('modalTrailerBtn').innerHTML = '<i class="bi bi-camera-reels-fill"></i> Ver Trailer';
            document.getElementById('modalTrailer').src = '';
        }
    });
}

function abrirModalFilme(filme) {
    criarModal();
    
    document.getElementById('modalTitulo').textContent = filme.titulo || 'Título';
    document.getElementById('modalGenero').textContent = filme.genero || 'Não informado';
    document.getElementById('modalAno').textContent = filme.ano || 'Não informado';
    document.getElementById('modalNota').innerHTML = filme.nota ? `<i class="bi bi-star-fill"></i> ${filme.nota}` : '<i class="bi bi-star-fill"></i> -';
    document.getElementById('modalSinopse').textContent = filme.descricao || filme.sinopse || 'Sinopse não disponível.';
    
    if (filme.trailer) {
        document.getElementById('modalTrailer').src = filme.trailer;
        document.getElementById('modalTrailerBtn').style.display = 'flex';
    } else {
        document.getElementById('modalTrailerBtn').style.display = 'none';
    }
    
    document.getElementById('modalTrailerContainer').style.display = 'none';
    document.getElementById('modalTrailerBtn').innerHTML = '<i class="bi bi-camera-reels-fill"></i> Ver Trailer';
    
    window.filmeAtualModal = filme;
    document.getElementById('filmeModal').classList.add('active');
}

function fecharModalFilme() {
    const modal = document.getElementById('filmeModal');
    if (modal) modal.classList.remove('active');
    document.getElementById('modalTrailer').src = '';
    document.getElementById('modalTrailerContainer').style.display = 'none';
    window.filmeAtualModal = null;
}

document.addEventListener('click', async (e) => {
    if (e.target.id === 'modalAddListaBtn' && window.filmeAtualModal) {
        const filme = window.filmeAtualModal;
        const token = localStorage.getItem('token');
        
        if (!token) {
            if (confirm('Faça login para adicionar filmes. Deseja ir para o login?')) {
                window.location.href = 'login.html';
            }
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
                    tmdb_id: filme.id || filme.tmdb_id,
                    status: 'quero_ver'
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(`${filme.titulo} adicionado à sua lista!`);
                fecharModalFilme();
            } else {
                alert(data.erro || 'Erro ao adicionar');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        }
    }
});
