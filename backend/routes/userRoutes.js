const express = require('express');
const { register, loginUser, getAllusers } = require('../controller/userController');
const protect = require('../middlewares/authMiddlewares');

const router = express.Router();

router.post('/', register)
      .post('/login', loginUser)  // Change this line
      .get('/', protect, getAllusers);

module.exports = router;
