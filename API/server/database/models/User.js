module.exports = function (sequelize, DataTypes) {
    return sequelize.define("user", {
        username: {
            type: DataTypes.STRING,
            validate: {
                isAlphanumeric: true
            }
        },
        password: DataTypes.STRING,
        salt: DataTypes.STRING,
        email: DataTypes.STRING,
        elo: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        gems: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        golds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        win: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        lose: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        lastAction: DataTypes.DATE
    },
        {
            paranoid: true
        });

}