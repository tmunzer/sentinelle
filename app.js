var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var sentinelle = require("./sentinelle");

var server_port = 80;

app.use(express.static(__dirname+'/static'));
app.get('/', function(req, res) {
    res.render("sentinelle.ejs");
    });



io.sockets.on('connection', function(socket) {
    console.log('new connection');
    var list = sentinelle.get_access_points();
    for (var ap in list){
        socket.emit("new_access_point", list[ap]);
    }
});

sentinelle.capture();
server.listen(server_port, function () {
    console.log("Server listening on port " + server_port + ".");
});

module.exports.io=io;
