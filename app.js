var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Sentinelle = require(__dirname + "/sentinelle");
var sentinelle = new Sentinelle("wlan0mon");
var server_port = 80;


// web server routes
app.use(express.static(__dirname + '/static'));
app.get('/', function (req, res) {
    res.render(__dirname + "/views/sentinelle.ejs");
});

//sentinelle.s_start("wlan0mon");

// Sentinelle Events
sentinelle.messenger.on('status', function (status) {
    console.log("sentinelle status: ", status);
    io.sockets.emit("sentinelle_status", status);
});
sentinelle.messenger.on('ssid', function (ssid, bssidList) {
    io.sockets.emit('ssid', ssid, bssidList);
});
sentinelle.messenger.on('BSSID', function (action, bssid) {
    io.sockets.emit('BSSID', action, bssid);
});
sentinelle.messenger.on('STA', function (action, station) {
    io.sockets.emit('STA', action, station);
});
sentinelle.messenger.on('test', function (test) {
    io.sockets.emit('test', test);
});

//socket events
io.sockets.on('connection', function (socket) {
    console.log('new connection');
    socket.emit('clear_all');
    sentinelle.is_running();
    for (var station in sentinelle.stationList) {
        socket.emit("STA", "new", sentinelle.stationList[station]);
    }
    for (var bssid in sentinelle.bssidList) {
        socket.emit("BSSID", 'new', sentinelle.bssidList[bssid]);
    }
    for (var ssid in sentinelle.ssidList) {
        socket.emit("SSID", 'new', sentinelle.ssidList[ssid]);
    }

    // if a user starts sentinelle
    socket.on("start", function () {
        sentinelle.s_start("wlan0mon");
    })
        // if a user stops sentinelle
        .on("stop", function () {
            sentinelle.s_stop();
        })
});

// starting server
server.listen(server_port, function () {
    console.log("Server listening on port " + server_port + ".");
});

// initialize sentinelle
sentinelle.init(false);



