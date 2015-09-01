var express = require('express');
var app = express();

app.use(express.static(__dirname+'/static'));
app.get('/', function(req, res) {
    res.render("sentinelle.ejs");
    })
    .get("/ap", function(req, res) {
        res.setHeader("Content-Type", "text/plain");
        res.end("not yet...")
    })
    .get("/sta", function(req, res) {
        res.setHeader("Content-Type", "text/plain");
        res.end("not yet...")
    })
    .get("/config", function(req, res) {
        res.setHeader("Content-Type", "text/plain");
        res.end("not yet...")
    })
    .use(function(req, res, next){
        res.setHeader('Content-Type', 'text/plain');
        res.send(404, 'Page introuvable !');
    });
app.listen(80);