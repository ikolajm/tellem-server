const router = require("express").Router();
const User = require('../../db').User;
const Friends = require("../../db").Friends;
const Request = require("../../db").FriendRequests;
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
const { colorGen } = require("../../helpers/colorGenerator");

router.put("/update/:uuid", async (req, res) => {
    const body = req.body;

    let incomingObj = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        username: body.username,
        avatarURL: "",
        idCode: body.idCode,
        statusMessage: body.statusMessage
    }
    if (body.password && body.password.trim() !== "") {
        incomingObj.password = bcrypt.hashSync(body.password, 10)
    }

    User.update(
        incomingObj,
        { 
            where: { uuid: req.params.uuid }, 
            returning: true,
            plain: true
        }
    )
    .then(user => {
        try {
            user[1].dataValues.background = body.background;
        }
        catch {
            user[1].dataValues.background = colorGen();
        }

        res.json({
            status: "SUCCESS",
            user: user[1]
        })
    })
    .catch(err => {
        res.json({
            status: "ERROR",
            message: err
        })
    })
});

router.post("/search", async (req, res) => {
    // Get all users for search
    let users = await User.findAll({
        limit: 10,
        where: {
            [Op.and]: {
                username: { [Op.iLike]: req.body.username + "%" },
                idCode: req.body.id
            }
        }
    })
    users.forEach(user => {
        user.dataValues.background = colorGen();
    })

    // Get ids for comparison
    // Friends
    let friendId = await Friends.findAll({
        where: { friendId: req.user.uuid }
    })
    let friendIds = []
    friendId.forEach(instance => friendIds.push(instance.userId))
    // Pending
    let incoming = await Request.findAll({
        where: { userTo: req.user.uuid },
    });
    // Get the ids of incoming
    incomingIds = []
    incoming.forEach(instance => {
        incomingIds.push(instance.dataValues.authorId)
    })
    // Get the ids of outgoing
    let outgoingRequests = await Request.findAll({
        where: { authorId: req.user.id }
    });
    let searchArray = []
    outgoingRequests.forEach(request => {
        searchArray.push(request.userTo)
    });
    let outgoingUsers = await User.findAll({
        where: { uuid: { [Op.in]: searchArray } }
    });
    // Get the ids of all users in outgoing search results
    let outgoing = []
    outgoingUsers.forEach(user => {
        outgoing.push(user.dataValues.id)
    })

    let pending = incomingIds.concat(outgoing)
    let friends = friendIds
    res.json({
        status: "SUCCESS",
        users,
        pending,
        friends
    })
})

module.exports = router;