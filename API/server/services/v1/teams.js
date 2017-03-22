module.exports = function (app, router) {
    var db = app.get("database");
    var config = app.get("config");
    var async = require("async");
    var middlewares = require("../../utilities/middlewares.js")(app);
    var models = require("../../database/models.json");

    router.get("/", middlewares.isAuth, middlewares.all(models.team.public, 0, 50, 100, "team"), (req, res) => {
        req.userId = req.auth.id;
        async.parallel({
            teams(cb) {
                db.Team.findAll({
                    where: req.filter,
                    attributes: req.fields,
                    offset: req.pagination.offset,
                    limit: req.pagination.limit,
                    order: req.sort,
                    include: [{
                        model: db.UserPlane,
                        include: [db.Plane]
                    }]
                }).then((teams) => {
                    cb(false, teams);
                }).catch((err) => {
                    cb(err);
                });
            },
            count(cb) {
                db.Team.count({
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
            res.status((results.count == results.teams.length) ? 200 : 206).json(results.teams);
        });
    });

    router.get("/:id", middlewares.isAuth, middlewares.fields(models.team.public), (req, res) => {
        db.Team.findOne({
            where: {
                id: req.params.id
            },
            attributes: req.fields,
            include: [{
                model: db.UserPlane,
                include: [db.Plane]
            }]
        }).then((team) => {
            if(team == null){
                res.status(404).json({
                    error: "not_found",
                    error_description: `Team with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            if(team.userId != req.auth.id){
                res.status(403).json({
                    error: "not_allowed",
                    error_description: `You can't access this team`
                });
                return;
            }

            res.status(200).json(team);
        }).catch((err) => {
            res.status(500).json({
                error: "server_error",
                error_description: err
            });
        });
    });

    router.post("/", middlewares.isAuth, middlewares.isAuth, (req, res) => {
        db.Team.create({
            name:req.body.name || "New Team",
            order:0,
            userId:req.auth.id
        }).then((team) => {
            res.status(201).json(team);
        }).catch(() => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    router.patch("/:id", middlewares.isAuth, middlewares.isAuth, (req, res) => {
        db.Team.findOne({
            where:{
                id:req.params.id
            }
        }).then((team) => {
            if(team == null){
                res.status(404).json({
                    error: "not_found",
                    error_description: `Team with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            if(team.userId != req.auth.id){
                res.status(403).json({
                    error: "not_allowed",
                    error_description: `You can't update this team`
                });
                return;
            }

            var patchData = {};
            for (var i in req.body) {
                if (["name", "order"].indexOf(i) != -1) {
                    patchData[i] = req.body[i];
                }
            }

            db.Team.update(patchData, 
            {
                where:{
                    id:req.params.id
                }
            }).then((team) => {
                res.status(200).send();
            }).catch(() => {
                res.status(500).json({
                    error: "server_error",
                    error_description: "Internal server error"
                });
            });

        }).catch(() => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    router.delete("/:id", middlewares.isAuth, (req, res) => {
        db.Team.findOne({
            where:{
                id:req.params.id
            }
        }).then((team) => {
            if(team == null){
                res.status(404).json({
                    error: "not_found",
                    error_description: `Team with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            if(team.userId != req.auth.id){
                res.status(403).json({
                    error: "not_allowed",
                    error_description: `You can't delete this team`
                });
                return;
            }


            db.TeamPlane.destroy({
                where:{
                    teamId:req.params.id
                }
            }).then(() => {
                team.destroy()
                .then(() => {
                    res.status(200).json(team);
                }).catch(() => {
                    res.status(500).json({
                        error: "server_error",
                        error_description: "Internal server error"
                    });
                });
            }).catch(() => {
                res.status(500).json({
                    error: "server_error",
                    error_description: "Internal server error"
                });
            });


        }).catch(() => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
        });
    });

    //planes
    router.post("/:id/plane/:plane", middlewares.isAuth, (req, res) => {
        db.Team.findOne({
            where: {
                id: req.params.id
            },
            attributes: req.fields,
            include: [{
                model: db.UserPlane,
                include: [db.Plane]
            }]
        }).then((team) => {
            if(team == null){
                res.status(404).json({
                    error: "not_found",
                    error_description: `Team with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            if(team.userId != req.auth.id){
                res.status(403).json({
                    error: "not_allowed",
                    error_description: `You can't update this team`
                });
                return;
            }

            db.User.findOne({
                where:{
                    id:req.auth.id,
                },
                include: [{
                    model: db.Plane,
                    where:{
                        id:req.params.plane
                    }
                }]
            }).then((userPlane) => {
                if(userPlane == null){
                    res.status(404).json({
                        error: "not_found",
                        error_description: `User with id '${req.auth.id}' doesn't have plane width id '${req.params.plane}'`
                    });
                    return;
                }

                var p = userPlane.planes[0];

                var levelSum = 0;
                for(var planeData of team.userplanes){
                    var plane = planeData.plane;
                    levelSum += plane.level;
                    if(plane.id == p.id){
                        res.status(400).json({
                            error: "already_in_team",
                            error_description: `Plane with id '${req.params.plane}' is already in Team with id '${team.id}'`
                        });
                        return;
                    }
                }

                if(levelSum + p.level > config.game.teamlevel){
                    res.status(400).json({
                        error: "team_level",
                        error_description: `Team level would be ${levelSum + plane.level} instead of ${config.game.teamlevel} max'`
                    });
                    return;
                }

                db.TeamPlane.create({
                    userplanePlaneId:p.id,
                    teamId:team.id
                }).then(() => {
                    res.status(201).json(p);
                }).catch((err) => {
                    res.status(500).json({
                        error: "server_error",
                        error_description: "Internal server error"
                    });
                });

            }).catch((err) => {
                res.status(500).json({
                    error: "server_error",
                    error_descriptiaon: "Internal server error"
                });
                return;
            });

        }).catch((err) => {
            res.status(500).json({
                error: "server_error",
                error_description: "Internal server error"
            });
            return;
        });
    });

    router.delete("/:id/plane/:plane", middlewares.isAuth, (req, res) => {
        db.Team.findOne({
            where:{
                id:req.params.id
            }
        }).then((team) => {
            if(team == null){
                res.status(404).json({
                    error: "not_found",
                    error_description: `Team with id '${req.params.id}' doesn't exist`
                });
                return;
            }

            if(team.userId != req.auth.id){
                res.status(403).json({
                    error: "not_allowed",
                    error_description: `You can't update this team`
                });
                return;
            }

            db.TeamPlane.destroy({
                where:{
                    teamId:req.params.id,
                    userplanePlaneId:req.params.plane
                }
            }).then((plane) => {
                res.status(200).json({id:req.params.plane});
            }).catch(() => {
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
            return;
        });
    });

}