const express = require("express");
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Chat data belongs to one user, so every chat endpoint must be protected.
router.use(authMiddleware);

router.post("/", chatController.chatWithPDF);
router.get("/history", chatController.getChatHistory);
router.delete("/history", chatController.deleteChatHistory);

module.exports = router;
