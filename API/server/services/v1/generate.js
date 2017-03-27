module.exports = function (app, router) {
    var db = app.get("database");
    var config = app.get("config");
    var async = require("async");
    var middlewares = require("../../utilities/middlewares.js")(app);
    var models = require("../../database/models.json");

    router.get("/users", middlewares.isAuth, (req, res) => {
        var users = [
            {
                username:"vincent",
                password:"ee67aff00e138c64ea63288bbd82d346a8731540ae743f9487f58f72375d59cfa9a2fe005758bfc3478f9336ea08ffa9193c943352c782bd83e928b9991b7f3b3a4793da8ab5ba42819925862fb9904c34adea34c83e9e1c074beb8ba2f0c0b9403f551629fe44f72301b6cbfecbb95584fe1bd533470757e1d4bcdba165331",
                salt:"52eda287-c274-44b9-b717-440c65e9216c",
            },
            {
                username:"bazia",
                password:"a52523168cc05e8697bba372f1fb91f6b65afc1102f3322c1f9ada3ae70299eef704d03b0d8c8f9c743cd176a4b359f0f71068f924b3a3d72061da76cc1245387dcb7ba6b761846380482fd8968c415b58d2b839986caa87bd105a6e8c94b59467f2e875a7d7d3fc9581d571a90eddca715b8d1a5b59d4e64c952bd01c234a5",
                salt:"495f69cf-986a-4f0d-b9d5-9e1bb753efde",
            },
        ];
        for(var user of users){
            db.User.create(user);
        }
        res.status(200).send();
    });

    router.get("/planes", (req, res) => {
        var planes = [
            {
                name:"Lapinou",
                level:5,
            },
            {
                name:"Cancer",
                level:8
            },
            {
                name:"Loup",
                level:3
            },
            {
                name:"Chat",
                level:1
            },
            {
                name:"Cheval",
                level:12
            },
            {
                name:"Canigou",
                level:7
            },
            {
                name:"ElGod",
                level:6
            }
        ];

        for(var plane of planes){
            plane.life = Math.floor(Math.random() * 100);
            plane.armor = Math.floor(Math.random() * 20);
            plane.radius = Math.floor(Math.random() * 50 + 5);
            db.Plane.create(plane);
        }
        res.status(200).send();
    });

    
}