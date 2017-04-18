module.exports = function (app, router) {
    var db = app.get("database");
    var jwt = require('jsonwebtoken');
    var middlewares = require("../../utilities/middlewares.js")(app);
    var config = app.get("config");
    var async = require("async");
    var redis = app.get("redis");
    var models = require("../../database/models.json");

    router.get("/", middlewares.all(models.match.public, 0, 10, 100, "match"), (req, res) => {
        async.parallel({
            matchs(cb) {
                db.Match.findAll({
                    where: req.filter,
                    attributes: req.fields,
                    offset: req.pagination.offset,
                    limit: req.pagination.limit,
                    order: req.sort,
                    include: [{
                        model: db.User,
                        attributes: models.user.public
                    },
                    {
                        model: db.UserPlane,
                        include: {
                            model: db.Plane
                        }
                    }
                    ]
                }).then((matchs) => {
                    matchs = JSON.parse(JSON.stringify(matchs));

                    for (var match of matchs) {
                        for (var plane of match.userplanes) {
                            if (!req.auth || req.auth.id != plane.userId) {
                                if (match.status == 0) {
                                    delete plane.planematch.x;
                                    delete plane.planematch.y;
                                    delete plane.planematch.direction;
                                }
                                delete plane.planematch.speed;
                                delete plane.planematch.rotation;
                            }
                        }
                    }

                    cb(false, matchs);
                }).catch((err) => {
                    cb(err);
                });
            },
            count(cb) {
                db.Match.count({
                    where: req.filter,
                }).then((count) => {
                    cb(false, count);
                }).catch((err) => {
                    cb(err);
                });
            }
        }, (err, results) => {
            if (err) {
                res.status(500).json({
                    error: "server_error",
                    error_description: "Internal server error"
                });
                return;
            }
            res.set("Content-Range", `${req.pagination.range}|${results.count}`);
            res.status((results.count == results.matchs.length) ? 200 : 206).json(results.matchs);
        });
    });

    router.get("/:id", middlewares.fields(models.match.public), (req, res) => {
        db.Match.findOne({
            where: {
                id: req.params.id
            },
            attributes: req.fields,
            include: [{
                model: db.User,
                attributes: models.user.public
            },
            {
                model: db.UserPlane,
                include: {
                    model: db.Plane
                }
            }
            ]
        }).then((match) => {
            if (match == null) {
                res.status(404).json({
                    error: "not_found",
                    error_description: `Match with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            match = JSON.parse(JSON.stringify(match));

            for (var plane of match.userplanes) {
                if (!req.auth || req.auth.id != plane.userId) {
                    if (match.status == 0) {
                        delete plane.planematch.x;
                        delete plane.planematch.y;
                        delete plane.planematch.direction;
                    }
                    delete plane.planematch.speed;
                    delete plane.planematch.rotation;
                }
            }

            res.status(200).json(match);
        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    var setTurn = function(match, userId, planes, callback){

    }

    router.post("/:id/turn", middlewares.isAuth, (req, res) => {
        db.Match.findOne({
            where: {
                id: req.params.id
            },
            attributes: req.fields,
            include: [{
                model: db.User,
                attributes: models.user.public
            },
            {
                model: db.UserPlane,
                include: {
                    model: db.Plane
                }
            }
            ]
        }).then((match) => {
            if (match == null) {
                res.status(404).json({
                    error: "not_found",
                    error_description: `Match with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            match = JSON.parse(JSON.stringify(match));

            if(match.status == 2){
                res.status(400).json({
                    error: "match_over",
                    error_description: "Match is already over"
                });
                return;
            }

            var inGame = false;
            for(var user of match.users){
                if(user.id == req.auth.id){
                    if(user.usermatch.hasPlayed){
                        res.status(400).json({
                            error: "already_played",
                            error_description: "You already played this turn"
                        });
                        return;
                    }
                    inGame = true;
                    break;
                }
            }

            if(!inGame){
                res.status(403).json({
                    error: "player_permission",
                    error_description: "You can't play in this match"
                });
                return;
            }

            setTurn(match, req.auth.id, req.body.turn, () => {
                res.status(200).json(match);
            });
            
        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });
}