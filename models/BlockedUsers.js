module.exports = (sequelize, DataTypes) => {
    const BlockedUsers = sequelize.define("blocked_users", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        blockedUser: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return BlockedUsers;
}