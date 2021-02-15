module.exports = (sequelize, DataTypes) => {
    const Friends = sequelize.define("friends", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        friendId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Friends;
}