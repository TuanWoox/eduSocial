const express = require('express');
const router = express.Router();
const memController = require('../controllers/member');

// Lấy thông báo của người dùng
router.get('/', memController.showMember);


module.exports = router;