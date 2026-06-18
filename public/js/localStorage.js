const filme =

JSON.parse(
    localStorage.getItem(
        "filmeSelecionado"
    )
);

const API_URL = '/api';

// ========================
// RENDER DETAILS
// ========================

if(filme){

    document.getElementById(
        "moviePoster"
    ).src =
    filme.poster_url || filme.poster;

    document.getElementById(
        "movieTitle"
    ).textContent =
    filme.titulo;

    document.getElementById(
        "movieGenre"
    ).textContent =
    filme.genero;

    document.getElementById(
        "movieType"
    ).textContent =
    filme.tipo;

    document.getElementById(
        "movieYear"
    ).textContent =
    filme.ano || filme.ano;

    document.getElementById(
        "movieRating"
    ).innerHTML =
    `<i class="bi bi-star-fill"></i> ${filme.nota || filme.nota}`;

    document.getElementById(
        "movieDescription"
    ).textContent =
    filme.sinopse || filme.descricao;

}


// ========================
// ADD TO WATCHLIST (COM BACKEND)
// ========================

const addButton =
document.getElementById(
    "addButton"
);

addButton.addEventListener(
    "click",
    async () => {

        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Faça login primeiro!');
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/watchlist`, {
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
            
            if (response.ok) {
                alert(`${filme.titulo} adicionado à sua lista!`);
            } else if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            } else {
                alert('Erro ao adicionar. Tente novamente.');
            }
        } catch (erro) {
            alert('Erro de conexão. Verifique se o servidor está rodando.');
        }

    }
);