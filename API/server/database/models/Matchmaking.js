module.exports = function (sequelize, DataTypes) {
    return sequelize.define("matchmaking", {
        ranked: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        lastTurn: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW')
        },
        turnTime:{
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        width: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        height: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        turn: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    }, {
        paranoid: true
    });

}