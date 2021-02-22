// Init
require("dotenv").config();

const app = require("express")();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const sequelize =  require('./db').sequelize;
sequelize.sync();

app.use(require("./middleware/headers"));

// Controllers
const UserAuth = require("./controllers/user/userAuth");
const UserProtected = require("./controllers/user/userProtected");
const History = require("./controllers/history/history");
const Friend = require("./controllers/friends/friends");
const Conversation = require("./controllers/conversation/conversation");
// - OPEN
app.use("/user", UserAuth);
// - CLOSED
app.use(require("./middleware/validate-session"));
app.use("/history", History);
app.use("/friends", Friend);
app.use("/user", UserProtected);
app.use("/conversation", Conversation);

// Seed if needed
const userExecute = require("./helpers/seed/execute");
const data = require("./helpers/seed/data").users;
// userExecute(data);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server is live on port ${port}`));