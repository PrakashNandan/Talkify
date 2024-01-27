const express = require('express'); 
const {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup} = require('../controller/chatController');

const protect = require('../middlewares/authMiddlewares');
const router = express.Router();


router.post('/', protect,accessChat)
      .get('/',protect, fetchChats)
      .post('/group', protect, createGroupChat)
      .put('/rename', protect, renameGroup)
      .put('/groupadd', protect, addToGroup)
      .put('/groupremove', protect, removeFromGroup)
      



module.exports = router;