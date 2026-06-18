const grid =
document.getElementById(
    "trendingGrid"
);

const banner =
document.getElementById(
    "trendBanner"
);

let filmes = [];


// =====================
// LOAD JSON
// =====================

async function carregar(){

    const response =
    await fetch(
        "data/filmes.json"
    );

    filmes =
    await response.json();

    renderHero();

    renderCards();

}

carregar();


// =====================
// HERO
// =====================

function renderHero(){

    const destaque =
    filmes[0];

    banner.style.backgroundImage =

    `
    linear-gradient(
        rgba(5,12,30,.2),
        rgba(5,12,30,.8)
    ),
    url('${destaque.poster}')
    `;

    banner.innerHTML =

    `
    <div class="trend-content">

        <span class="trend-tag">

            <i class="bi bi-fire"></i> Trending #1

        </span>

        <h2 class="trend-title">

            ${destaque.titulo}

        </h2>

        <p class="trend-description">

            ${destaque.descricao}

        </p>

        <button
            class="trend-btn"
            onclick="abrirDetalhes(${destaque.id})">

            Ver detalhes

        </button>

    </div>
    `;

}


// =====================
// GRID
// =====================

function renderCards(){

    grid.innerHTML = "";

    filmes.forEach(filme => {

        const card =
        document.createElement(
            "div"
        );

        card.className =
        "movie-card";

        card.innerHTML =

        `
        <img
            src="${filme.poster}"
            class="movie-poster"
        >

        <div class="movie-content">

            <h3 class="movie-title">

                ${filme.titulo}

            </h3>

            <div class="movie-info">

                <span>
                    ${filme.tipo}
                </span>

                <span
                    class="movie-rating">

                    <i class="bi bi-star-fill"></i> ${filme.nota}

                </span>

            </div>

            <button
                class="add-btn">

                Ver detalhes

            </button>

        </div>
        `;

        card.addEventListener(
            "click",
            () => {

                abrirDetalhes(
                    filme.id
                );

            }
        );

        grid.appendChild(
            card
        );

    });

}


// =====================
// DETAILS
// =====================

function abrirDetalhes(
    id
){

    const filme =

    filmes.find(item =>

        item.id === id
    );

    localStorage.setItem(
        "filmeSelecionado",
        JSON.stringify(
            filme
        )
    );

    window.location.href =
    "detalhes.html";

}