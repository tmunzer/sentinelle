var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Sentinelle = require("./sentinelle").Sentinelle;
var sentinelle = new Sentinelle("wlan0mon");
var ap_list;
var server_port = 80;

app.use(express.static(__dirname+'/static'));
app.get('/', function(req, res) {
    res.render("sentinelle.ejs");
    });


io.sockets.on('connection', function(socket) {
    console.log('new connection');

    // if sentinelle is already running, send the sentinelle status and the AP list to the new user
    if (sentinelle.is_running() == true) {
        socket.emit("sentinelle_status", "running");
        ap_list = sentinelle.get_access_points();
        for (var ap in ap_list){
            socket.emit("new_access_point", ap_list[ap]);
        }
        // if sentinelle is not running, send the sentinelle status
    } else {
        socket.emit("sentinelle_status", "stopped");
    }


    // if a user starts sentinelle
    socket.on("start", function() {
        if (sentinelle.is_running() != true){
            socket.emit("sentinelle_status", "starting");
            sentinelle.s_start("wlan0mon");
            io.sockets.emit("sentinelle_status", "running");
        }
    });
    // if a user stops sentinelle
    socket.on("stop", function() {
        console.log("stop");
        sentinelle.s_stop();
        io.sockets.emit('sentinelle_status', "stopped");
    })
});
server.listen(server_port, function () {
    console.log("Server listening on port " + server_port + ".");
});

modul