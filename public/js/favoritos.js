// ==========================
// ELEMENTOS
// ==========================

const container = document.getElementById("watchlistContainer");
const contadorSpan = document.getElementById("contadorLista");
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

// ==========================
// ATUALIZAR CONTADOR
// ==========================

function atualizarContador() {
    if (contadorSpan) {
        const total = watchlist.length;
        const assistidos = watchlist.filter(item => item.status === "assistido").length;
        contadorSpan.innerHTML = `<i class="bi bi-bar-chart-fill"></i> ${total} título${total !== 1 ? 's' : ''} • ${assistidos} assistido${assistidos !== 1 ? 's' : ''}`;
    }
}

// ==========================
// READ - RENDERIZAR LISTA
// ==========================

function renderizarLista() {
    if (!container) return;
    container.innerHTML = "";
    
    if (watchlist.length === 0) {
        container.innerHTML = `
            <div class="empty-message" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="bi bi-camera-reels-fill"></i> <strong>Sua watchlist está vazia</strong><br><br>
                Vá em <strong>Explorar</strong> e adicione filmes ou séries.
            </div>
        `;
        atualizarContador();
        return;
    }

    watchlist.forEach((filme, idx) => {
        const card = document.createElement("div");
        card.className = "watch-card";
        
        let statusTexto = "";
        let statusEmoji = "";
        
        if (filme.status === "assistido") {
            statusTexto = "Assistido";
            statusEmoji = '<i class="bi bi-check-circle-fill"></i>';
        } else if (filme.status === "assistindo") {
            statusTexto = "Assistindo";
            statusEmoji = '<i class="bi bi-play-fill"></i>';
        } else {
            statusTexto = "Quero assistir";
            statusEmoji = '<i class="bi bi-alarm-fill"></i>';
        }
        
        card.innerHTML = `
            <img src="${filme.poster}" alt="${filme.titulo}" onerror="this.src='assets/poster-placeholder.jpg'">
            <div class="watch-content">
                <h3>${filme.titulo}</h3>
                <div class="watch-info">${filme.tipo} • ${filme.ano}<br><small>${statusEmoji} ${statusTexto}</small></div>
                <div class="watch-actions">
                    <button class="watch-btn done-btn" data-index="${idx}">${filme.status === "assistido" ? '<i class="bi bi-check-circle-fill"></i> Já vi' : '<i class="bi bi-camera-reels-fill"></i> Marcar visto'}</button>
                    <button class="watch-btn remove-btn" data-index="${idx}"><i class="bi bi-trash3-fill"></i> Remover</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // UPDATE - Marcar como assistido
    document.querySelectorAll(".done-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(btn.dataset.index);
            marcarAssistido(index);
        });
    });
    
    // DELETE - Remover filme
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(btn.dataset.index);
            removerFilme(index);
        });
    });
    
    atualizarContador();
}

// ==========================
// UPDATE - Marcar como assistido
// ==========================

function marcarAssistido(index) {
    const statusAtual = watchlist[index].status;
    let novoStatus;
    let mensagem;
    
    if (statusAtual === "assistido") {
        novoStatus = "quero_ver";
        mensagem = `"${watchlist[index].titulo}" voltou para "Quero assistir"!`;
    } else if (statusAtual === "assistindo") {
        novoStatus = "assistido";
        mensagem = `"${watchlist[index].titulo}" marcado como assistido!`;
    } else {
        novoStatus = "assistindo";
        mensagem = `"${watchlist[index].titulo}" agora está "Assistindo"!`;
    }
    
    watchlist[index].status = novoStatus;
    salvarLista();
    alert(mensagem);
}

// ==========================
// DELETE - Remover filme
// ==========================

function removerFilme(index) {
    const titulo = watchlist[index].titulo;
    if (confirm(`Tem certeza que quer remover "${titulo}" da sua lista?`)) {
        watchlist.splice(index, 1);
        salvarLista();
        alert(`"${titulo}" removido da sua watchlist!`);
    }
}

// ==========================
// SALVAR E RECARREGAR
// ==========================

function salvarLista() {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    renderizarLista();
}

// ==========================
// INICIAR
// ==========================

renderizarLista();
