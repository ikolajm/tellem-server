module.exports = (sequelize, DataTypes) => {
    const Conversation = sequelize.define("conversations", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        conversationPhoto: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Conversation;
}