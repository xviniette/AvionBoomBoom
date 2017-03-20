module.exports = function (app, router) {
    var db = app.get("database");
    var config = app.get("config");
    var async = require("async");
    var middlewares = require("../../utilities/middlewares.js")(app);
    var models = require("../../database/models.json");

    router.post("/", middlewares.getAuthUser, (req, res) => {
        if (req.body.ranked == false) {

        } else {
            db.Matchmaking.findOne({
                where: {
                    ranked: true,
                    turnTime: req.body.turnTime,

                },
                include: [{
                    model: db.User,
                    where: {
                        id: req.params.plane
                    }
                }]
            })
        }
        db.Matchmaking.create({

        });
    });

    router.get("/", middlewares.isAuth, (req, res) => {

    });

    router.delete("/:id", middlewares.isAuth, (req, res) => {

    });
}