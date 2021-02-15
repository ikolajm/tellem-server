module.exports = (sequelize, DataTypes) => {
    const ConversationArchive = sequelize.define("conversation_archives", {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    return ConversationArchive;
}