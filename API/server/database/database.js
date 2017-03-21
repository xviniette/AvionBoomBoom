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
    var MatchmakingPlane = sequelize.import("./models/MatchmakingPlane");
    var NetworkAuth = sequelize.import("./models/NetworkAuth");
    var TokenBlacklist = sequelize.import("./models/TokenBlacklist");

    

    //USER PLANE
    Plane.belongsToMany(User, {
        through: UserPlane
    });
    User.belongsToMany(Plane, {
        through: UserPlane
    });
    UserPlane.belongsTo(User);
    UserPlane.belongsTo(Plane);

    //TEAM
    Team.belongsTo(User);
    UserPlane.belongsToMany(Team, {
        through: TeamPlane
    });
    Team.belongsToMany(UserPlane, {
        through: TeamPlane
    });
    TeamPlane.belongsTo(Team);
    TeamPlane.belongsTo(UserPlane);

    //USER MATCH
    User.belongsToMany(Match, {
        through: UserMatch
    });
    Match.belongsToMany(User, {
        through: UserMatch
    });
    UserMatch.belongsTo(Match);
    UserMatch.belongsTo(User);

    Match.belongsToMany(UserPlane, {
        through: PlaneMatch
    });
    UserPlane.belongsToMany(Match, {
        through: PlaneMatch
    });
    PlaneMatch.belongsTo(UserMatch);
    PlaneMatch.belongsTo(Match);
    PlaneMatch.belongsTo(UserPlane);

    Matchmaking.belongsTo(User, {as:"from"});
    Matchmaking.belongsTo(User, {as:"to"});
    Matchmaking.belongsToMany(UserPlane, {
        through: MatchmakingPlane
    });
    UserPlane.belongsToMany(Matchmaking, {
        through: MatchmakingPlane
    });

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