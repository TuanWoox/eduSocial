const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notification');
const {isYourNotification,isLoggedIn} = require('../middleware/checkMiddleware');


// Lấy thông báo của người dùng
router.get('/',isLoggedIn, notificationsController.getUserNotifications);

// Đánh dấu thông báo là đã đọc
router.patch('/:id/read',isYourNotification,isLoggedIn, notificationsController.markAsRead);
router.get('/unread-count',isLoggedIn, notificationsController.getUnreadNotificationCount);


module.exports = router;
