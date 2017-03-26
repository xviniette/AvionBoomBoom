module.exports = function (sequelize, DataTypes) {
    return sequelize.define("userplane", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    });

}