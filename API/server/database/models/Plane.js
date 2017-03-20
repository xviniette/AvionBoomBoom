module.exports = function (sequelize, DataTypes) {
    return sequelize.define("plane", {
        name: {
            type: DataTypes.STRING,
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        life: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        armor: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        radius: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        minspeed: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        maxspeed: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        rotation: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        damage: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        range: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        shootAngle: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
        },
        fireRate: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    },
        {
            paranoid: true
        });

}