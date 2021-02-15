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
// - OPEN
app.use("/user", UserAuth);
// - CLOSED
app.use(require("./middleware/validate-session"));

const port = process.env.PORT;
app.listen(port, () => console.log(`Server is live on port ${port}`));