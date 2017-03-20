module.exports = function (sequelize, DataTypes) {
    return sequelize.define("token_blacklist", {
        token: DataTypes.TEXT,
        valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        expire: DataTypes.INTEGER
    });
}