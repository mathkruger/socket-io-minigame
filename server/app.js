const Express = require("express")()
const Http = require("http").Server(Express)
const Socketio = require("socket.io")(Http)

var players = [];
var comidas = [];

const possibleColors = ['#c7429d', '#c74242', '#4258c7', '#42c74f', '#a842c7', '#e0db48'];

var updatePlayers = (player, index) => {
    player.emit("position", players[index]);
    Socketio.emit("update_players", players);
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

Socketio.on("connection", socket => {
    socket.username = makeid(6);

    players.push({
        x: 200,
        y: 200,
        radius: 20,
        username: socket.username,
        color: possibleColors[randomInt(0, possibleColors.length - 1)],
        score: 0
    });
    
    updatePlayers(socket, players.findIndex(x => x.username == socket.username));
    gerarComida();

    socket.on('score_up', data => {
        var indexComida = comidas.findIndex(x => x.id == data.id);
        var indexPlayer = players.findIndex(x => x.username == socket.username);

        console.log('comida recebida', indexComida)

        if(indexComida >= 0) {
            players[indexPlayer].score += 10;
            players[indexPlayer].radius += 5;
            comidas.splice(indexComida, 1);
        }

        updatePlayers(socket, indexPlayer);
        Socketio.emit("update_foods", comidas);
    })

    socket.on('disconnect', data => {
        var index = players.findIndex(x => x.username == socket.username);
        players.splice(index, 1)
        updatePlayers(socket)
	});

    socket.on("move", data => {
        var index = players.findIndex(x => x.username == socket.username);

        switch(data) {
            case "left":
                players[index].x -= 5;
                socket.x -= 5;
            break;

            case "right":
                players[index].x += 5;
                socket.x += 5;
            break;

            case "up":
                players[index].y -= 5;
                socket.y -= 5;
            break;

            case "down":
                players[index].y += 5;
                socket.y += 5;
            break;
        }

        updatePlayers(socket, index)
    })
})

setInterval(() => {
    gerarComida();
}, 10000);

function gerarComida() {
    comidas.push({ x: randomInt(0, 500), y: randomInt(0, 500), id: makeid(20) });
    Socketio.emit("update_foods", comidas);
}

function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

Http.listen(1232, () => {
    console.log('ESCUTANDO NA PORTA :1232')
})