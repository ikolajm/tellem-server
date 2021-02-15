const router = require('express').Router();
const User = require('../../db').User;
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { colorGen } = require("../../helpers/colorGenerator");

// Create a user
router.post('/create', async (req, res) => {
    let body = req.body;
    // Find if email in use
    let user = await User.findOne({
        where: { email: body.email }
    });
    // If user query returned result - return error
    if (user) {
        res.json({
            status: "ERROR",
            message: "That email already being used by an account"
        });
    // Else email is not in use - create the user
    } else {
        // Produce random 5 digit code between 1 and 99999
        let code = Math.floor((Math.random() * 99999) + 1);

        let userObj = {
            uuid: await uuidv4(),
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            username: body.username,
            idCode: code,
            avatarURL: null,
            statusMessage: null,
            lastOnline: Date.now()
        };

        let createdUser = await User.create(userObj)
        console.log("createdUser", createdUser)
        let token = jwt.sign( { uuid: createdUser.uuid }, process.env.JWT_SECRET, { expiresIn: 60*60*24 });
        createdUser.dataValues.background = colorGen();
        console.log("createdUser data values", createdUser)

        if (!createdUser.firstName) {
            res.json({
                status: "ERROR",
                message: "Failure to create user account"
            })
        }

        res.json({
            status: "SUCCESS",
            sessionToken: token,
            user: createdUser
        });
    }

})

// Sign in to user account
router.post('/signin', async (req, res) => {
    let body = req.body
    // See if user with given email exists
    let user = await User.findOne({
        where: { email: body.email }
    });
    // If the user does not exist - return error
    if (!user) {
        res.json({
            status: "ERROR",
            message: "Account not found with that email"
        })
    }
    user = user.dataValues
    // Else the user email exists - compare password and continue
    // Compare the passwords of input and password on record
    bcrypt.compare(body.password, user.password, async (err, match) => {
        if (!match) {
            return res.json({
                status: "ERROR",
                message: "Incorrect password for provided email"
            });
        }
        // If the passwords match, log in the user and proceed to application
        let token = jwt.sign( { uuid: user.uuid }, process.env.JWT_SECRET, { expiresIn: 60*60*24 });
        user.background = colorGen();

        res.json({
            status: "SUCCESS",
            sessionToken: token,
            user
        });
    })
})

router.post("/authenticate", async (req, res) => {
    let sessionToken = req.body.token;
    jwt.verify(sessionToken, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            res.json({
                status: "ERROR",
                message: "Valid user session not found with current token"
            })
        }

        let user = await User.findOne({ where: { uuid: decodedToken.uuid } })
        user.dataValues.background = colorGen();

        res.json({
            status: "SUCCESS",
            user
        })
    })
})

// Update user profile
router.put("/profile/edit/:uuid", async (req, res) => {
    const body = req.body;

    let user = await User.update(body, {
        where: {uuid: req.params.uuid},
        plain: true
    })

    res.json({
        status: "SUCCESS",
        user
    })
});

module.exports = router;