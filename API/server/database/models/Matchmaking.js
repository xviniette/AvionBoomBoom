module.exports = function (sequelize, DataTypes) {
    return sequelize.define("matchmaking", {
        ranked: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        turnTime: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
        }
    });

}