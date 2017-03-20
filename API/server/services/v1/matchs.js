module.exports = function (app, router) {
    var db = app.get("database");
    var jwt = require('jsonwebtoken');
    var middlewares = require("../../utilities/middlewares.js")(app);
    var config = app.get("config");
    var async = require("async");
    var redis = app.get("redis");
    var models = require("../../database/models.json");

    router.get("/", middlewares.all(models.match.public, 0, 10, 100), (req, res) => {
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
                            model: db.Map,
                            attributes: ["id", "name", "type", "playable", "difficulty"]
                        }
                    ]
                }).then((matchs) => {
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
                    model: db.Map,
                    attributes: ["id", "name", "type", "playable", "difficulty"]
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

            res.status(200).json(match);
        }).catch((err) => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    router.post("/", (req, res) => {
        if (!req.body.data) {
            res.status(400).json({
                error: "bad_request",
                error_description: "Missing server informations"
            });
            return;
        }

        jwt.verify(req.body.data, config.jwtServer, (err, decoded) => {
            if (err) {
                res.status(401).json({
                    error: "no_access",
                    error_description: "Wrong password"
                });
                return;
            }

            redis.hget("game", decoded.id, (err, game) => {
                if (err) {
                    res.status(500).json({
                        error: "server_error",
                        error_description: "Internal server error"
                    });
                    return;
                }

                if (game == null) {
                    res.status(404).json({
                        error: "game_not_found",
                        error_description: "Game doesn't exist"
                    });
                    return;
                }

                db.Match.create({
                    mapId: decoded.map,
                    score1: decoded.score1,
                    score2: decoded.score2
                }).then((match) => {
                    async.each(decoded.players, (player, callback) => {
                        db.UserMatch.create({
                            matchId: match.id,
                            userId: player.id,
                            team: player.team
                        }).then(() => {
                            callback(false);
                        }).catch((err) => {
                            callback(err);
                        });
                    }, (err) => {
                        res.status(200).json(match);
                    });

                }).catch((err) => {
                    res.status(500).json({
                        error: "server_error",
                        error_description: "Internal server error"
                    });
                });
            });
        });
    });
}