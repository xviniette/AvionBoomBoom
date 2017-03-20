module.exports = function (sequelize, DataTypes) {
    return sequelize.define("network_auth", {
        network: DataTypes.STRING,
        networkId: DataTypes.STRING
    });

}