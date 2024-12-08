const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about');

// Lấy thông báo của người dùng
router.get('/', aboutController.showAbout);


module.exports = router;