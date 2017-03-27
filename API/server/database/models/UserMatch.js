module.exports = function (sequelize, DataTypes) {
    return sequelize.define("usermatch", {
        hasPlayed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        playDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        won:{
            type: DataTypes.BOOLEAN,
        }
    },
        {
            paranoid: true
        });

}