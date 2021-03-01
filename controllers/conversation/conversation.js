const router = require("express").Router();
const User = require('../../db').User;
const UserConversation = require("../../db").UserConversation;
const Conversation = require("../../db").Conversation;
const Message = require("../../db").Message;
const {colorGen} = require("../../helpers/colorGenerator");
const { Op } = require("sequelize");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');


const formatSingle = async (conversation, limit, offset) => {
    // Get conversation information
    let foundConversation = await Conversation.findOne({
        where: { id: conversation.conversationId }
    })

    foundConversation.dataValues.background = colorGen();
    
    // Get conversationId, search for all UserConversation instances
    let allUserInstances = await UserConversation.findAll({
        where: { conversationId: conversation.conversationId }
    })

    // Get all users for this conversation
    let userIds = [];
    allUserInstances.forEach(instance => {
        userIds.push(instance.userId);
    })
    let allUsers = await User.findAll({
        where: { id: { [Op.in]: userIds }}
    })

    allUsers.forEach(user => {
        user.dataValues.background = colorGen();
    })

    // Get first set of messages for conversation with their respective authors
    let messages = await Message.findAll({
        where: { conversationId: conversation.conversationId },
        order: [["createdAt", "DESC"]],
        // limit,
        // offset,
        include: [
            {
                model: User
            }
        ]
    })
    
    // =============================
    let sortedMessages = []
    let messageArray = []
    let compareDate = ""
    // Group previous messages by date sent
    messages.forEach((message, index) => {
        // Cut off createdAt to show YEAR-MONTH-DAY
        let created = moment(message.createdAt).format("L")
        // If starting function, set compareDate
        if (index === 0) { compareDate = created }
        // See if dates compare
        if (compareDate === created) {
            messageArray.push(message)
            if (index === messages.length - 1) {
                messageArray.reverse()
                sortedMessages.push({date: compareDate, messages: messageArray})
            }
        } else {
            messageArray.reverse()
            sortedMessages.push({date: moment(messageArray[0].createdAt).format("L"), messages: messageArray})
            compareDate = created
            messageArray = [message]
            if (index === messages.length - 1) {
                sortedMessages.push({date: compareDate, messages: messageArray})
            }
        }
    })
    sortedMessages.reverse()
    // =============================

    let obj = {
        conversation: foundConversation,
        users: allUsers,
        messages: sortedMessages
    }
    return obj;
}

// Get batch of messages for conversation/all users involved
router.post("/:id", async (req, res) => {
    // Get all conversations that user is involved in
    let conversation = await UserConversation.findOne({
        where: { conversationId: req.params.id }
    })

    let obj = await formatSingle(conversation, 51, req.body.offset);

    res.json({
        status: "SUCCESS",
        conversation: obj
    })
})

// Save changes to conversation
router.put("/update/:id", async (req, res) => {
    let conversationEdit = await Conversation.update(
        {
            conversationPhoto: "",
            name: req.body.name
        },
        {
            where: { id: req.params.id },
            returning: true,
            plain: true
        }
    )

    res.json({
        status: "SUCCESS",
        conversationEdit: conversationEdit[1]
    })
});

// Add user to conversation
router.post("/add/user/:id", async (req, res) => {
    // Get the ids of the new users
    let userIds = req.body.userIds
    // Create user conversation for new users
    userIds.forEach(id => {
        let uuid = uuidv4()
        let obj = {
            uuid,
            userId: id,
            conversationId: req.params.id
        }
        let conversation = UserConversation.create(obj)
    })
    // Get all new users, and return them to be added to the user array client side
    let allUsers = await User.findAll({
        where: { id: { [Op.in]: userIds }}
    })
    allUsers.forEach(user => {
        user.dataValues.background = colorGen();
    })
    
    if (allUsers.length > 0) {
        res.json({
            status: "SUCCESS",
            users: allUsers
        })
    }
})

// Create conversation
router.post("/create", async (req, res) => {
    let uuid1 = await uuidv4();
    // Create conversations
    let conversation = await Conversation.create({
        uuid: uuid1,
        name: "",
        description: "",
        conversationPhoto: ""
    })
    // Create userConversationArchive instances
    let users = [req.body.friendId];
    users.push(req.user.id)
    const forLoop = async () => {
        for (let i = 0; i < users.length; i++) {
            let uuid2 = await uuidv4();
            UserConversation.create({
                uuid: uuid2,
                userId: users[i],
                conversationId: conversation.id
            })
        }
        return true;
    }
    let loop = await forLoop();
    // Create message and assign to user conversation
    let uuid3 = await uuidv4();
    Message.create({
        uuid: uuid3,
        content: req.body.content,
        type: "text",
        hidden: false,
        userId: req.user.id,
        conversationId: conversation.id,
        edited: false
    })

    res.json({
        status: "SUCCESS",
        conversationId: conversation.id
    })
})

module.exports = router;