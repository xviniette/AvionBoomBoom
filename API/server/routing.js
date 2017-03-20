module.exports = function (app) {
    var express = app.get("express");
    var fs = require("fs");
    var async = require("async");
    var jwt = require("jsonwebtoken");
    var config = app.get("config");

    var middlewares = require("./utilities/middlewares.js")(app);

    app.use(middlewares.jwtConfirm);
    app.use(middlewares.urlManager);

    //All API Services
    var routeDir = __dirname + "/services/";

    fs.readdir(routeDir, function (err, directories) {
        if (err) {
            return;
        }

        async.each(directories, function (directory, DirCallback) {

            fs.readdir(routeDir + directory, function (err, files) {
                async.each(files, function (file, fileCallback) {
                    var router = express.Router();
                    app.use("/" + directory + "/" + file.split(".")[0], router);
                    var route = require(routeDir + directory + "/" + file)(app, router);
                    fileCallback();
                }, function (err) {
                    DirCallback();
                });
            });
        }, function (err) {
            //404 ERROR
            app.all("*", function (req, res) {
                res.status(404).json({
                    error: "not_found",
                    error_description: `${req.method} ${req.urlManager.fullUrl} doesn't exist`
                });
            });
        });
    });
}