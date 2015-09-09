var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Sentinelle = require("./sentinelle");
var sentinelle = new Sentinelle("wlan0mon");
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
sentinelle.messenger.on('SSID', function (SSID, BSSIDs) {
    io.sockets.emit('SSID', SSID, BSSIDs);
});
sentinelle.messenger.on('BSSID', function (action, BSSID) {
    io.sockets.emit('BSSID', action, BSSID);
});
sentinelle.messenger.on('STA', function (action, STA) {
    io.sockets.emit('STA', action, STA);
});

//socket events
io.sockets.on('connection', function (socket) {
    console.log('new connection');
    socket.emit('clear_all');
    sentinelle.is_running();
    for (var STA in sentinelle.STAList){
        socket.emit("STA", "new", sentinelle.STAList[STA]);
    }
    for (var BSSID in sentinelle.BSSIDList) {
        socket.emit("BSSID", 'new', sentinelle.BSSIDList[BSSID]);
    }
    for (var SSID in sentinelle.SSIDList){
        socket.emit("SSID", 'new', sentinelle.SSIDList[SSID]);
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

// starting server
server.listen(server_port, function () {
    console.log("Server listening on port " + server_port + ".");
});

// initialize sentinelle
sentinelle.init(false);



