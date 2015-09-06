var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Sentinelle = require("./sentinelle");
var sentinelle = new Sentinelle("wlan0mon");
var ap_list;
var server_port = 80;


// web server routes
app.use(express.static(__dirname + '/static'));
app.get('/', function (req, res) {
    res.render("sentinelle.ejs");
});

//sentinelle.s_start("wlan0mon");

// Sentinelle Events
sentinelle.messenger.on('status', function (status) {
    console.log("sentinelle status: ", status);
    io.sockets.emit("sentinelle_status", status);
});
sentinelle.messenger.on("new_access_point", function (accessPoint) {
    io.sockets.emit('new_access_point', accessPoint);
});
sentinelle.messenger.on('update_access_point', function (accessPoint) {
    io.sockets.emit('update_access_point', accessPoint);
});

//socket events
io.sockets.on('connection', function (socket) {
    console.log('new connection');
    socket.emit('clear_all');
    sentinelle.is_running();
    ap_list = sentinelle.get_access_points();
    for (var ap in ap_list) {
        socket.emit("new_access_point", ap_list[ap]);
    }

    // if a user starts sentinelle
    socket.on("start", function () {
        sentinelle.s_start("wlan0mon");
    });
    // if a user stops sentinelle
    socket.on("stop", function () {
        sentinelle.s_stop();
    })
});


// initialize sentinelle
sentinelle.init(false);

// starting server
server.listen(server_port, function () {
    console.log("Server listening on port " + server_port + ".");
});

