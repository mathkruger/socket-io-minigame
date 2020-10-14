const { isObject } = require("util");

const Express = require("express")()
const Http = require("http").Server(Express)
const Socketio = require("socket.io")(Http)

var players = [];

var updatePlayers = (player) => {
    player.emit("position", { username: player.username, x: player.x, y: player.y });
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
    socket.x = 200
    socket.y = 200
    socket.username = makeid(6);
    players.push({
        x: socket.x,
        y: socket.y,
        username: socket.username
    });
    
    updatePlayers(socket);

    socket.on('disconnect', data => {
        players.splice(players.indexOf({ username: socket.username }), 1)
        updatePlayers(socket)
	});

    socket.on("move", data => {
        let aux = players.findIndex(x => x.username == socket.username);

        switch(data) {
            case "left":
                players[aux].x -= 5;
                socket.x -= 5;
            break;

            case "right":
                players[aux].x += 5;
                socket.x += 5;
            break;

            case "up":
                players[aux].y -= 5;
                socket.y -= 5;
            break;

            case "down":
                players[aux].y += 5;
                socket.y += 5;
            break;
        }

        updatePlayers(socket)
    })
})

Http.listen(1232, () => {
    console.log('ESCUTANDO NA PORTA :1232')
})