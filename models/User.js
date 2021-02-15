module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            isEmail: true,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        idCode: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        avatarURL: {
            type: DataTypes.STRING,
            allowNull: true
        },
        statusMessage: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastOnline: {
            type: DataTypes.DATE,
            allowNull: true
        }
    })
    return User;
}