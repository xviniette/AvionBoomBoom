module.exports = function (sequelize, DataTypes) {
    return sequelize.define("planematch", {
        life: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        x: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        y: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        direction: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        targetX:{
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        targetY:{
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        historic: {
            type: DataTypes.TEXT
        }
    });

}