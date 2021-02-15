module.exports = (sequelize, DataTypes) => {
    const Call = sequelize.define('calls', {
        uuid: {
            type: DataTypes.STRING,
            allowNull: false
        },
        initiator: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        conversationReceiver: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Call;
}