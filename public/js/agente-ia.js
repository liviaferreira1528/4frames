const AGENTE_IA = {
    mapearEmocao: function(texto) {
        const emocoes = {
            feliz: ['feliz', 'alegre', 'contente', 'animado', 'empolgado', 'bem', 'otimo', 'alegria', 'felicidade', 'sorrir', 'risada', 'comedia'],
            triste: ['triste', 'deprimido', 'chorar', 'melancolico', 'sozinho', 'bad', 'tristeza', 'depressão', 'luto', 'perda', 'desanimado'],
            ansioso: ['ansioso', 'nervoso', 'preocupado', 'estressado', 'agitado', 'ansiedade', 'estresse', 'medo', 'apreensivo'],
            nostalgico: ['nostalgico', 'saudade', 'lembrar', 'antigo', 'infancia', 'memoria', 'passado', 'saudosismo'],
            romantico: ['amor', 'romance', 'paixao', 'namorando', 'crush', 'amoroso', 'romântico', 'coração'],
            empolgado: ['empolgado', 'animado', 'festa', 'celebrar', 'energico', 'empolgação', 'vibrando', 'felizao']
        };
        
        const textoLower = texto.toLowerCase();
        
        for (let [emocao, palavras] of Object.entries(emocoes)) {
            for (let palavra of palavras) {
                if (textoLower.includes(palavra)) {
                    return emocao;
                }
            }
        }
        return 'neutro';
    },
    
    getRecomendacoes: function(emocao) {
        const catalogo = {
            feliz: [
                { id: 1, titulo: "O Auto da Compadecida", tipo: "filme", genero: "Comédia", ano: 2000, sinopse: "As aventuras de João Grilo e Chicó no sertão nordestino.", poster: "assets/posters/autodacompadecida.jpg" },
                { id: 2, titulo: "Divertidamente", tipo: "filme", genero: "Animação", ano: 2015, sinopse: "As emoções de uma garota competem pelo controle de sua mente.", poster: "assets/posters/divertidamente.jpg" },
                { id: 3, titulo: "As Branquelas", tipo: "filme", genero: "Comédia", ano: 2004, sinopse: "Dois agentes do FBI se disfarçam de socialites.", poster: "assets/posters/branquelas.jpg" },
                { id: 4, titulo: "Rio", tipo: "filme", genero: "Animação", ano: 2011, sinopse: "Uma arara-azul vai ao Rio de Janeiro.", poster: "assets/posters/Rio.jpg" }
            ],
            triste: [
                { id: 5, titulo: "Um Sonho de Liberdade", tipo: "filme", genero: "Drama", ano: 1994, sinopse: "Um banqueiro é condenado por um crime que não cometeu.", poster: "assets/posters/umsonhopossivel.jpg" },
                { id: 6, titulo: "Sempre ao Seu Lado", tipo: "filme", genero: "Drama", ano: 2009, sinopse: "A comovente história real de um cão fiel.", poster: "" },
                { id: 7, titulo: "À Procura da Felicidade", tipo: "filme", genero: "Drama", ano: 2006, sinopse: "Um pai enfrenta dificuldades para sustentar seu filho.", poster: "" },
                { id: 8, titulo: "Titanic", tipo: "filme", genero: "Romance/Drama", ano: 1997, sinopse: "Um romance proibido a bordo do navio mais famoso.", poster: "assets/posters/titanic.jpg" }
            ],
            ansioso: [
                { id: 9, titulo: "O Poderoso Chefão", tipo: "filme", genero: "Drama", ano: 1972, sinopse: "A história da família Corleone.", poster: "" },
                { id: 10, titulo: "Interestelar", tipo: "filme", genero: "Ficção", ano: 2014, sinopse: "Uma equipe viaja por um buraco de minhoca.", poster: "assets/posters/Interstellar.jpg" },
                { id: 11, titulo: "Clube da Luta", tipo: "filme", genero: "Drama", ano: 1999, sinopse: "Um homem forma um clube de luta com um misterioso vendedor.", poster: "" }
            ],
            nostalgico: [
                { id: 12, titulo: "De Volta para o Futuro", tipo: "filme", genero: "Aventura", ano: 1985, sinopse: "Um adolescente viaja no tempo em um DeLorean.", poster: "" },
                { id: 13, titulo: "E.T.", tipo: "filme", genero: "Ficção", ano: 1982, sinopse: "Um garoto faz amizade com um alienígena.", poster: "assets/posters/et.jpg" },
                { id: 14, titulo: "Os Caça-Fantasmas", tipo: "filme", genero: "Comédia", ano: 1984, sinopse: "Três professores se tornam caçadores de fantasmas.", poster: "assets/posters/oscacafantasmas2.jpg" }
            ],
            romantico: [
                { id: 15, titulo: "Diário de uma Paixão", tipo: "filme", genero: "Romance", ano: 2004, sinopse: "Um romance eterno entre um operário e uma jovem rica.", poster: "assets/posters/diariodeumapaixao.jpg" },
                { id: 16, titulo: "10 Coisas que Odeio em Você", tipo: "filme", genero: "Comédia Romântica", ano: 1999, sinopse: "Um garoto é pago para namorar a garota mais mal-humorada.", poster: "assets/posters/10coisasqueodeioemvoce.jpg" },
                { id: 17, titulo: "Para Sempre", tipo: "filme", genero: "Romance", ano: 2012, sinopse: "Um casal enfrenta os desafios do amor.", poster: "" }
            ],
            empolgado: [
                { id: 18, titulo: "Velozes e Furiosos", tipo: "filme", genero: "Ação", ano: 2001, sinopse: "Policial infiltrado no mundo das corridas de rua.", poster: "" },
                { id: 19, titulo: "Vingadores: Ultimato", tipo: "filme", genero: "Aventura", ano: 2019, sinopse: "Os Vingadores se reúnem para reverter as ações de Thanos.", poster: "" },
                { id: 20, titulo: "Mad Max", tipo: "filme", genero: "Ação", ano: 2015, sinopse: "Em um futuro distópico, um solitário ajuda um grupo.", poster: "" }
            ],
            neutro: [
                { id: 21, titulo: "O Grande Truque", tipo: "filme", genero: "Drama", ano: 2006, sinopse: "Dois mágicos rivais competem para criar o melhor truque.", poster: "" },
                { id: 22, titulo: "O Lobo de Wall Street", tipo: "filme", genero: "Comédia/Drama", ano: 2013, sinopse: "A ascensão e queda de um corretor da bolsa.", poster: "" },
                { id: 23, titulo: "Coringa", tipo: "filme", genero: "Drama", ano: 2019, sinopse: "A história de origem do icônico vilão.", poster: "" }
            ]
        };
        return catalogo[emocao] || catalogo.neutro;
    },
    
    mensagemPersonalizada: function(emocao) {
        const mensagens = {
            feliz: "Você está com um bom humor! Selecionamos algumas comédias para manter a vibe.",
            triste: "Momentos difíceis passam. Esses filmes podem trazer conforto e esperança.",
            ansioso: "Respire fundo. Essas histórias vão te ajudar a relaxar e se concentrar.",
            nostalgico: "Vamos viajar no tempo com esses clássicos que marcaram época.",
            romantico: "Histórias de amor e conexão que combinam com o que você está sentindo.",
            empolgado: "Energia lá em cima! Confira essas produções eletrizantes.",
            neutro: "Hora do cinema! Escolha um desses filmes para começar."
        };
        return mensagens[emocao] || mensagens.neutro;
    },
    
    adicionarNaLista: function(filme) {
        let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        if (!watchlist.some(item => item.id === filme.id)) {
            watchlist.push({
                id: filme.id,
                titulo: filme.titulo,
                tipo: filme.tipo,
                genero: filme.genero,
                ano: filme.ano,
                adicionado_em: new Date().toISOString()
            });
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
            return true;
        }
        return false;
    }
};