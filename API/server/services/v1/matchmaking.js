module.exports = function (app, router) {
    var db = app.get("database");
    var config = app.get("config");
    var async = require("async");
    var middlewares = require("../../utilities/middlewares.js")(app);
    var models = require("../../database/models.json");

    router.get("/from", middlewares.isAuth, (req, res) => {
        db.Matchmaking.findAll({
            where: {
                fromId: req.auth.id
            },
            include: [{
                    model: db.UserPlane,
                    include: [db.Plane]
                },
                {
                    model: db.User,
                    as: "to",
                    attributes: models.user.public,
                }
            ]
        }).then((mms) => {
            res.status(200).json(mms);
        }).catch((err) => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    router.get("/to", middlewares.isAuth, (req, res) => {
        db.Matchmaking.findAll({
            where: {
                toId: req.auth.id
            },
            include: [{
                model: db.User,
                as: "from",
                attributes: models.user.public,
            }]
        }).then((mms) => {
            res.status(200).json(mms);
        }).catch((err) => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    router.post("/", middlewares.getAuthUser, (req, res) => {
        if (!req.body.turnTime) {
            req.body.turnTime = 24 * 60 * 1000;
        }

        if (!req.body.planes) {
            res.status(400).json({
                error: "no_planes",
                error_description: "You have to choose planes"
            });
            return;
        }

        req.body.planes = req.body.planes.split("|");
        var planes = [];
        for (var i in req.body.planes) {
            var plane = req.body.planes[i];
            planes.push(plane);
        }

        db.UserPlane.findAll({
            where: {
                id: planes,
                userId: req.auth.id
            },
            include: [{
                model: db.Plane,
            }]
        }).then((planes) => {
            if (planes.length == 0) {
                res.status(400).json({
                    error: "no_planes",
                    error_description: "You have to choose planes"
                });
                return;
            }

            var sumLevel = 0;
            for (var plane of planes) {
                sumLevel += plane.plane.level;
            }

            if (sumLevel > config.game.teamlevel) {
                res.status(400).json({
                    error: "team_level",
                    error_description: `Team level would be ${sumLevel} instead of ${config.game.teamlevel} max`
                });
                return;
            }


            if (req.body.ranked == true) {
                //RANKED
                var deltaElo = 200;
                db.Matchmaking.findAll({
                    where: {
                        fromId: {
                            $ne: req.auth.id
                        },
                        toId: null,
                        turnTime: req.body.turnTime,
                        ranked: true,
                        elo: {
                            $between: [req.auth.user.elo - deltaElo, req.auth.user.elo + deltaElo]
                        }
                    }
                }).then((mms) => {
                    if (mms.length == 0) {
                        db.Matchmaking.create({
                            fromId: req.auth.id,
                            toId: null,
                            turnTime: req.body.turnTime,
                            ranked: true,
                            elo: req.auth.user.elo
                        }).then((mm) => {
                            async.each(planes, function (plane, callback) {
                                db.MatchmakingPlane.create({
                                    userplaneId: plane.id,
                                    matchmakingId: mm.id
                                }).then(() => {
                                    callback();
                                }).catch((err) => {
                                    callback(false);
                                });
                            }, function (err) {
                                if (err) {
                                    res.status(500).json(mm);
                                    return;
                                }
                                res.status(200).json(mm);
                            });

                        }).catch((err) => {
                            res.status(500).json({
                                error: "server_error",
                                error_description: "Internal server error"
                            });
                        });
                    } else {
                        var mm = mms[Math.floor(Math.random() * mms.length)];

                        mm.update({
                            toId: req.auth.id
                        }).then((mm) => {
                            async.each(planes, function (plane, callback) {
                                db.MatchmakingPlane.create({
                                    userplaneId: plane.id,
                                    matchmakingId: mm.id
                                }).then(() => {
                                    callback();
                                }).catch((err) => {
                                    callback(false);
                                });
                            }, function (err) {
                                if (err) {
                                    res.status(500).json(mm);
                                    return;
                                }

                                createGame(mm.id, (err, match) => {
                                    if(err){
                                        res.status(500).json(err);
                                        return;
                                    }
                                    res.status(200).json(match);
                                });

                            });

                        }).catch((err) => {
                            res.status(500).json({
                                error: "server_error",
                                error_description: "Internal server error"
                            });
                        });
                    }


                }).catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        error: "server_error",
                        error_description: "Internal server error"
                    });
                });
            } else {
                //UNRANKED
                if (req.body.to == undefined) {
                    res.status(400).json({
                        error: "opponent_missing",
                        error_description: `Opponent is missing`
                    });
                    return;
                }

                if (req.body.to == req.auth.id) {
                    res.status(400).json({
                        error: "challenging_yourself",
                        error_description: `You can't challenge yourself`
                    });
                    return;
                }

                db.User.findOne({
                    where: {
                        id: req.body.to
                    }
                }).then((user) => {
                    if (user == null) {
                        res.status(404).json({
                            error: "not_found",
                            error_description: `User with id '${req.params.id}' doesn't exist`
                        });
                        return;
                    }

                    db.Matchmaking.findOne({
                        where: {
                            fromId: user.id,
                            toId: req.auth.id,
                            ranked: false,
                            turnTime: req.body.turnTime
                        }
                    }).then((matchmaking) => {
                        if (matchmaking == null) {
                            db.Matchmaking.create({
                                fromId: req.auth.id,
                                toId: user.id,
                                turnTime: req.body.turnTime,
                                ranked: false,
                                elo: req.auth.user.elo
                            }).then((mm) => {
                                async.each(planes, function (plane, callback) {
                                    db.MatchmakingPlane.create({
                                        userplaneId: plane.id,
                                        matchmakingId: mm.id
                                    }).then(() => {
                                        callback();
                                    }).catch((err) => {
                                        callback(false);
                                    });
                                }, function (err) {
                                    if (err) {
                                        res.status(500).json(mm);
                                        return;
                                    }
                                    res.status(200).json(mm);
                                });

                            }).catch((err) => {
                                res.status(500).json({
                                    error: "server_error",
                                    error_description: "Internal server error"
                                });
                            });
                        } else {
                            async.each(planes, function (plane, callback) {
                                db.MatchmakingPlane.create({
                                    userplaneId: plane.id,
                                    matchmakingId: matchmaking.id
                                }).then(() => {
                                    callback();
                                }).catch((err) => {
                                    callback(false);
                                });
                            }, function (err) {
                                createGame(matchmaking.id, (err, match) => {
                                    if(err){
                                        res.status(500).json(err);
                                        return;
                                    }
                                    res.status(200).json(match);
                                });
                            });
                        }
                    }).catch((err) => {
                        res.status(500).json({
                            error: "server_error",
                            error_description: "Internal server error"
                        });
                    });
                }).catch((err) => {
                    res.status(500).json({
                        error: "server_error",
                        error_description: "Internal server error"
                    });
                });
            }

        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    router.delete("/:id", middlewares.isAuth, (req, res) => {
        db.Matchmaking.findOne({
            where: {
                id: req.params.id
            }
        }).then((mm) => {
            if (mm == null) {
                res.status(404).json({
                    error: "not_found",
                    error_description: `Matchmaking with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            if (mm.fromId != req.auth.id && mm.toId != req.auth.id) {
                res.status(403).json({
                    error: "not_allowed",
                    error_description: `You can't delete this matchmaking`
                });
                return;
            }

            db.MatchmakingPlane.destroy({
                where: {
                    matchmakingId: mm.id
                }
            }).then(() => {
                mm.destroy().then(() => {
                    res.status(200).json(mm);
                }).catch((err) => {
                    console.log(err);
                    res.status(500).json({
                        error: "server_error",
                        error_description: "Internal server error"
                    });
                })
            }).catch((err) => {
                console.log(err);
                res.status(500).json({
                    error: "server_error",
                    error_description: "Internal server error"
                });
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    var createGame = function (id, cb) {
        db.Matchmaking.findOne({
            where: {
                id: id
            },
             include: [{
                    model: db.UserPlane,
                    include: [db.Plane]
                }
            ]
        }).then((mm) => {

            db.Match.create({
                ranked: mm.ranked,
                turnTime: mm.turnTime,
                width: 1000,
                height: 1000,
                turn: 0,
                status: 0
            }).then((match) => {
                async.each([mm.fromId, mm.toId], (user, callback) => {
                    db.UserMatch.create({
                        hasPlayed: 0,
                        userId: user,
                        matchId: match.id
                    }).then((usermatch) => {
                        callback();
                    }).catch((err) => {
                        callback(err);
                    });
                }, (err) => {
                    if (err) {
                        cb(err);
                        return;
                    }
                    async.each(mm.userplanes, (userplane, callback) => {
                        db.PlaneMatch.create({
                            matchId:match.id,
                            userplaneId:userplane.id,
                            usermatchUserId:userplane.userId,
                            life:userplane.plane.life
                        }).then(() => {
                            callback();
                        }).catch((err) => {
                            callback(true);
                        });
                    }, (err) => {
                        if(err){
                            cb(err);
                            return;
                        }
                        db.MatchmakingPlane.destroy({
                            where:{
                                matchmakingId:mm.id
                            }
                        }).then(() => {
                            db.Matchmaking.destroy({
                                where:{
                                    id:mm.id
                                }
                            }).then(() => {
                                cb(false, match);
                            }).catch(() => {

                            })
                        }).catch((err) => {

                        })
                    });
                });

            }).catch((err) => {
                cb(err);
            })
        }).catch((err) => {
            cb(err);
        });
    }
}