module.exports = function (sequelize, DataTypes) {
    return sequelize.define("skin", {
        name: {
            type: DataTypes.STRING,
        },
    },
        {
            paranoid: true
        });

}