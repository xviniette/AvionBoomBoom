module.exports = function (app, router) {
    var db = app.get("database");
    var config = app.get("config");
    var async = require("async");
    var middlewares = require("../../utilities/middlewares.js")(app);
    var models = require("../../database/models.json");

    router.get("/", middlewares.isAuth, (req, res) => {
        db.Plane.findAll().then((planes) => {
            if(planes.length == 0){
                res.status(400).json({
                    error: "no_planes",
                    error_description: "no available planes"
                });
                return;
            }            

            var p = planes[Math.floor(Math.random() * planes.length)];   
            db.UserPlane.findOne({
                where:{
                    userId:req.auth.id,
                    planeId:p.id  
                }
            }).then((plane) => {
                if(plane == null){
                    db.UserPlane.create({
                        userId:req.auth.id,
                        planeId:p.id
                    }).then((plane) => {
                        res.status(201).json(plane);
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).json({
                            error: "server_error",
                            error_description: "Internal server error"
                        });
                    });
                }else{
                    res.status(400).json({
                        error: "already_posseded",
                        error_description: "You already have this plane"
                    });
                }
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

    
}