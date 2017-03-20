var express = require('express');
var app = express();
app.set("express", express);
var http = require('http').Server(app);
var fs = require('fs');
var async = require("async");
const path = require('path');

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

var config = require("./server/config/default.json");
app.set("config", config);

var database = require("./server/database/database.js")(app);
app.set("database", database);
// var redis = require("./server/database/redis.js")(app);
// app.set("redis", redis);

app.use(express.static(path.join(__dirname, '../public')));

var routes = require('./server/routing.js')(app);
http.listen(config.PORT, () => {
  console.log(`API SERVER LISTEN ON PORT ${config.PORT}`);
});

process.on('uncaughtException', function (exception) {
  console.log(exception);

});