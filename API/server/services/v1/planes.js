module.exports = function (app, router) {
    var db = app.get("database");
    var config = app.get("config");
    var async = require("async");
    var middlewares = require("../../utilities/middlewares.js")(app);
    var models = require("../../database/models.json");

    router.get("/", middlewares.all(models.plane.public, 0, 50, 100, "plane"), (req, res) => {
        async.parallel({
            planes(cb) {
                db.Plane.findAll({
                    where: req.filter,
                    attributes: req.fields,
                    offset: req.pagination.offset,
                    limit: req.pagination.limit,
                    order: req.sort
                }).then((planes) => {
                    cb(false, planes);
                }).catch((err) => {
                    cb(err);
                });
            },
            count(cb) {
                db.Plane.count({
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
            res.status((results.count == results.planes.length) ? 200 : 206).json(results.planes);
        });
    });

    router.get("/:id", middlewares.fields(models.plane.public), (req, res) => {
        db.Plane.findOne({
            where: {
                id: req.params.id
            },
            attributes: req.fields
        }).then((plane) => {
            if (plane == null) {
                res.status(404).json({
                    error: "not_found",
                    error_description: `Plane with id '${req.params.id}' doesn't exist`
                });
                return;
            }
            res.status(200).json(plane);
        }).catch((err) => {
            res.status(500).json({
                error: "server_error",
                error_description: err
            });
        });
    });

    router.post("/", middlewares.isAuth, (req, res) => {
        
    });

    router.patch("/", middlewares.isAuth, (req, res) => {

    });

    router.delete("/", middlewares.isAuth, (req, res) => {

    });

}