const Sequelize = require("sequelize");

// Initialize postgres connection
const sequelize = new Sequelize(`${process.env.DATABASE_URL}`, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: true
    }
});

// Authenticate postgres connection
sequelize.authenticate()
.then(() => console.log('Successful connection to postgres database...'))
.catch(err => console.log('POSTGRES CONNECTION FAILURE:', err));

// db Object init
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./models/User")(sequelize, Sequelize);
db.Conversation = require("./models/Conversation")(sequelize, Sequelize);
db.Message = require("./models/Message")(sequelize, Sequelize);
db.Call = require("./models/Call")(sequelize, Sequelize);
db.Friends = require("./models/Friends")(sequelize, Sequelize);
db.FriendRequests = require("./models/FriendRequests")(sequelize, Sequelize);
db.BlockedUsers = require("./models/BlockedUsers")(sequelize, Sequelize);
db.UserConversation = require("./models/UserConversation")(sequelize, Sequelize);
db.UserConversationArchive = require("./models/UserConversationArchive")(sequelize, Sequelize);

// Associations
db.User.hasMany(db.Message);
db.Message.belongsTo(db.User);
db.User.hasMany(db.Call);
db.Call.belongsTo(db.User);
db.Conversation.hasMany(db.Message);
db.Message.belongsTo(db.User);
db.User.hasMany(db.Friends);
db.Friends.belongsTo(db.User);
db.FriendRequests.belongsTo(db.User, { foreignKey: "authorId" });
db.BlockedUsers.belongsTo(db.User, { foreignKey: "blockedBy" });

module.exports = db;