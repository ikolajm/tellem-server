const db = require("../../db");
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSeed = users => {
    users.forEach(user => {
        user.password = bcrypt.hashSync(user.password, 10);
        user.lastOnline = Date.now();

        db.User.create(user)
        .then(created => console.log("created user"))
        .catch(err => console.log(err))
    });
};

module.exports = userSeed;