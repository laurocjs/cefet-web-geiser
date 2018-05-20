var express = require('express'),
    app = express();
const fs = require('fs');
const url = require('url');

function funcDeComparacaoDeJogos(a, b) {
    return -(a.playtime_forever - b.playtime_forever);
}

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
var db = {
    jogadores: JSON.parse(fs.readFileSync('server/data/jogadores.json', 'utf8')),
    jogosPorJogador: JSON.parse(fs.readFileSync('server/data/jogosPorJogador.json', 'utf8'))
};

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs');


// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
app.set('views', 'server/views');
app.get('/', function (req, res) {
    res.render('index', db);
});
// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código
app.get('/jogador/:numero_identificador/', function (req, res) {
    for (let player of db.jogadores.players) {
        if (player.steamid == req.params.numero_identificador) {
            let dadosjogador = {};
            dadosjogador.jogador = player;
            let jogos = db.jogosPorJogador[player.steamid];
            dadosjogador.jogador.numerodejogos = jogos.game_count;
            dadosjogador.jogador.numerodejogosnaojogados = 0;
            dadosjogador.jogador.listadejogos = [];
            for (let jogo of jogos.games) {
                if (jogo.playtime_forever > 40) { // só considerei jogado se jogou pelo menos 40m
                    jogo.tempo = (jogo.playtime_forever/60).toFixed();
                    dadosjogador.jogador.listadejogos.push(jogo);
                }
                else {
                    dadosjogador.jogador.numerodejogosnaojogados++;
                }
            }

            dadosjogador.jogador.listadejogos.sort(funcDeComparacaoDeJogos);
            dadosjogador.jogador.listadejogos.splice(5, dadosjogador.jogador.listadejogos.length);
            dadosjogador.jogador.jogopreferido = dadosjogador.jogador.listadejogos[0];          
            res.render('jogador', dadosjogador);
        }
    }
    db.idDoJogador = req.params.numero_identificador;
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static('client'));

// abrir servidor na porta 3000
// dica: 1-3 linhas de código
app.listen(3000);
