module.exports = function (sequelize, DataTypes) {
    return sequelize.define("team", {
        name: {
            type: DataTypes.STRING,
            defaultValue: true,
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    });

}