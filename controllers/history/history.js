const router = require("express").Router();
const UserConversation = require("../../db").UserConversation;
const UserConversationArchive = require("../../db").UserConversationArchive;
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");
const formatConversations = require("../../helpers/formatting/formatConversations");

// Get all visible conversations
router.get("/visible", async (req, res) => {
    let user = req.user
    // Get archives to add to query criteria
    let archives = await UserConversationArchive.findAll({
        where: { userId: user.id },
        attributes: ["conversationId"]
    })
    let archiveIds = [];
    archives.forEach(archive => archiveIds.push(archive.conversationId))

    // Get all conversations that user is involved in
    let userConversations = await UserConversation.findAll({
        where: {
            [Op.and]: [
                { userId: req.user.id },
                { conversationId: { [Op.notIn]: archiveIds } }
            ]
        }
    })

    let conversations = await formatConversations(userConversations);

    res.json({
        status: "SUCCESS",
        conversations
    })
})

// Get all archived conversations
router.get("/archived", async (req, res) => {
    // Get archives to add to query criteria
    let archives = await UserConversationArchive.findAll({
        where: { userId: req.user.id },
        attributes: ["conversationId"]
    })
    let archiveIds = [];
    archives.forEach(archive => archiveIds.push(archive.conversationId))

    // Get all conversations that user is involved in
    let userConversations = await UserConversation.findAll({
        where: {
            [Op.and]: [
                { userId: req.user.id },
                { conversationId: { [Op.in]: archiveIds } }
            ]
        }
    })

    let conversations = await formatConversations(userConversations);

    res.json({
        status: "SUCCESS",
        conversations
    })
})

// Get both visible and archived conversations
router.get("/all", async (req, res) => {
    // Get all conversations that user is involved in
    let userConversations = await UserConversation.findAll({
        where: { userId: req.user.id }
    })
    let archives = await UserConversationArchive.findAll({
        where: { userId: req.user.id },
        attributes: ["conversationId"]
    })
    let archiveIds = [];
    archives.forEach(archive => archiveIds.push(archive.conversationId))

    let conversations = await formatConversations(userConversations);

    conversations.forEach(conversation => {
        if (archiveIds.includes(conversation.id)) {
            conversation.dataValues.archived = true
        }
    })

    res.json({
        status: "SUCCESS",
        conversations
    })
})

// Archive a conversation
router.get("/archive/:id", async (req, res) => {
    let uuid = await uuidv4();
    let archive = {
        uuid,
        userId: req.user.id,
        conversationId: req.params.id
    }

    UserConversationArchive.create(archive)
    .then(created => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

// Unarchive a conversation
router.delete("/unarchive/:id", async (req, res) => {
    UserConversationArchive.destroy({
        where: { userId: req.user.id, conversationId: req.params.id }
    })
    .then(deleted => res.json({ status: "SUCCESS" }))
    .catch(err => res.json({ status: "ERROR", err: err.message }))
})

module.exports = router