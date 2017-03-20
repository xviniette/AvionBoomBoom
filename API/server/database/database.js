module.exports = function (app) {
    var Sequelize = require("sequelize");
    var config = app.get("config");
    var sequelize = new Sequelize(config.mariadb.database, config.mariadb.username, config.mariadb.password, {
        host: config.mariadb.host,
        dialect: 'mariadb',
        logging: false
    });

    var User = sequelize.import("./models/User");
    var Plane = sequelize.import("./models/Plane");
    var Match = sequelize.import("./models/Match");
    var UserMatch = sequelize.import("./models/UserMatch");
    var PlaneMatch = sequelize.import("./models/PlaneMatch");
    var UserPlane = sequelize.import("./models/UserPlane");
    var Team = sequelize.import("./models/Team");
    var TeamPlane = sequelize.import("./models/TeamPlane");
    var Matchmaking = sequelize.import("./models/Matchmaking");
    var NetworkAuth = sequelize.import("./models/NetworkAuth");
    var TokenBlacklist = sequelize.import("./models/TokenBlacklist");

    User.belongsToMany(Match, {
        through: UserMatch
    });
    Plane.belongsToMany(User, {
        through: UserPlane
    });
    User.belongsToMany(Plane, {
        through: UserPlane
    });
    Team.belongsTo(User);
    Plane.belongsToMany(Team, {
        through: TeamPlane
    });
    Team.belongsToMany(Plane, {
        through: TeamPlane
    });
    Match.belongsToMany(User, {
        through: UserMatch
    });
    Match.belongsToMany(Plane, {
        through: PlaneMatch
    });
    Plane.belongsToMany(Match, {
        through: PlaneMatch
    });
    PlaneMatch.belongsTo(UserMatch);

    Matchmaking.belongsTo(User, {as:"from"});
    Matchmaking.belongsTo(User, {as:"to"});

    NetworkAuth.belongsTo(User);
    TokenBlacklist.belongsTo(User);

    sequelize.sync();

    return {
        sequelize: sequelize,
        User,
        Plane,
        Match,
        UserMatch,
        PlaneMatch,
        UserPlane,
        Team,
        TeamPlane,
        Matchmaking,
        NetworkAuth,
        TokenBlacklist
    };
}