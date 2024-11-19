const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notification');

// Lấy thông báo của người dùng
router.get('/', notificationsController.getUserNotifications);

// Đánh dấu thông báo là đã đọc
router.patch('/:id/read', notificationsController.markAsRead);
router.get('/unread-count', notificationsController.getUnreadNotificationCount);


module.exports = router;
