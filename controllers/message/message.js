const router = require("express").Router();
const User = require('../../db').User;
const Message = require("../../db").Message;
const { v4: uuidv4 } = require('uuid');

// Create conversation
router.post("/create", async (req, res) => {
    let uuid1 = await uuidv4();
    let message = await Message.create({
        uuid: uuid1,
        content: req.body.content,
        type: "text",
        hidden: false,
        userId: req.user.id,
        conversationId: req.body.conversationId,
        edited: false,
    })

    console.log(message)

    message.dataValues.user = req.user

    res.json({
        status: "SUCCESS",
        message
    })
})

module.exports = router;