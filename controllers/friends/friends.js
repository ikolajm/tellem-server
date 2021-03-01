const router = require("express").Router();
const Friend = require("../../db").Friends
const User = require("../../db").User;
const Request = require("../../db").FriendRequests;
const { colorGen } = require("../../helpers/colorGenerator");
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");

router.get("/all", async (req, res) => {
    // Get all friends of the user
    let friendId = await Friend.findAll({
        where: { friendId: req.user.uuid }
    })
    let ids = []
    friendId.forEach(instance => ids.push(instance.userId))

    let friends = await User.findAll({
        where: { id: { [Op.in]: ids } },
        order: [ [ 'username', 'ASC' ]],
    })

    friends.forEach(friend => {
        friend.dataValues.background = colorGen();
    })

    res.json({
        status: "SUCCESS",
        friends
    })
})

router.get("/all/id", async (req, res) => {
    // Get all friends of the user
    let friendId = await Friend.findAll({
        where: { friendId: req.user.uuid },
        attributes: ["id"]
    })

    let arr = []
    friendId.forEach(i => arr.push(i.id))

    res.json({
        status: "SUCCESS",
        friends: arr
    })
})

router.get("/pending", async (req, res) => {
    let incoming = await Request.findAll({
        where: { userTo: req.user.uuid },
        order: [["createdAt", "DESC"]],
        include: {
            model: User
        }
    });

    // Give each user a set background color in case of no avatar
    incoming.forEach(instance => {
        instance.dataValues.user.dataValues.background = colorGen();
    })

    let outgoing = await Request.findAll({
        where: { authorId: req.user.id }
    });
    let searchArray = []
    outgoing.forEach(request => {
        searchArray.push(request.userTo)
    });

    let outgoingUsers = await User.findAll({
        where: { uuid: { [Op.in]: searchArray } }
    });

    // Take the outgoing request array, and append the appropriate user object to the array index (assume retrieval of users is equal to the outgoing request id)
    let outgoingMod = [];
    outgoing.forEach((item, index) => {
        item.dataValues.user = outgoingUsers[index];
        try {
            item.dataValues.user.dataValues.background = colorGen();
        } catch {
            console.log("potential problem here")
        }
        outgoingMod.push(item);
    });

    res.json({
        status: "SUCCESS",
        incoming,
        outgoing: outgoingMod
    })
})

// Send friend request
router.post("/request/create/:uuid", async (req, res) => {
    let uuid = await uuidv4();
    Request.create({
        uuid,
        userTo: req.params.uuid,
        authorId: req.user.id
    })
    .then(created => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Cancel friend request
router.delete("/request/delete/:id", async (req, res) => {
    Request.destroy({
        where: { userTo: req.params.id, authorId: req.user.id }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Accept friend request
router.post("/request/accept/:uuid", async (req, res) => {
    let uuid1 = await uuidv4();
    let createFriendShip1 = await Friend.create({
        uuid: uuid1,
        friendId: req.body.friendUuid,
        userId: req.user.id
    })
    let uuid2 = await uuidv4();
    let createFriendShip2 = await Friend.create({
        uuid: uuid2,
        friendId: req.user.uuid,
        userId: req.body.friendId
    })
    Request.delete({
        where: { uuid: req.params.uuid }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Decline friend request
router.delete("/request/decline/:uuid", async (req, res) => {
    Request.destroy({
        where: { uuid: req.params.uuid }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Unfriend user
router.post("/friendship/delete", async (req, res) => {
    let userFriendship = await Friend.findAll({
        where: { userId: req.user.id, friendId: req.body.friendUuid }
    })

    let friendFriendship = await Friend.findAll({
        where: { userId: req.body.friendId, friendId: req.user.uuid }
    })

    let deleteIds = [userFriendship.id, friendFriendship.id];
    
    Friend.destroy({
        where: { id: { [Op.in]: deleteIds } }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

module.exports= router