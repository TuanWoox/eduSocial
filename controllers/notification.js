const Notification = require('../models/notification');

const topic = {
    title: 'Thông báo',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}
// để hiện thông báo
module.exports.getUserNotifications = async (req, res) => {
    const perPage = 10; // Số lượng thông báo mỗi trang
    const page = parseInt(req.query.page) || 1;

    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('sender', 'name profilePic')
            .populate('post', 'title')
            .populate('question', 'title')
            .populate('comment', 'body');

        const totalNotifications = await Notification.countDocuments({
            recipient: req.user._id
        });

        res.render('notifications/index', {
            topic,
            notifications,
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / perPage)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Đã xảy ra lỗi khi lấy thông báo.');
    }
};
//đánh dấu đã đọc
module.exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ message: 'Thông báo không tồn tại.' });
        }
        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: 'Thông báo đã được đánh dấu là đã đọc.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Đã xảy ra lỗi khi đánh dấu thông báo là đã đọc.');
    }
};

module.exports.getUnreadNotificationCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({ 
            recipient: req.user._id, 
            isRead: false 
        });
        res.status(200).json({ unreadCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đếm thông báo chưa đọc.' });
    }
};

