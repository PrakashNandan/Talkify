const express = require('express');
const protect = require('../middlewares/authMiddlewares');
const { sendMessage, allMessages } = require('../controller/messageController');

const router = express.Router();


router.
       post('/', protect, sendMessage)
       .get('/:chatId', protect, allMessages)


module.exports = router;