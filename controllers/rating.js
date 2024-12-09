const Rating = require('../models/rating');
const Notification = require('../models/notification');
const Course = require('../models/course');
module.exports.saveRating = async (req,res) => {
    const newRating = new Rating(req.body);
    newRating.courseRated = req.params.id;
    newRating.author = req.user._id;
    await newRating.save();
    const course = await Course.findById(req.params.id).populate('author');
    if (course && !course.author.equals(req.user._id)) {
        // Tạo thông báo cho chủ sở hữu bài viết
        const courseNotification = new Notification({
            recipient: course.author._id,
            sender: req.user._id,
            course: req.params.id,
            rating: newRating.id,
            message: `${req.user.name} đã đánh giá về khóa học của bạn.`,
            isRead: false,
        });
        await courseNotification.save();
    }
    res.redirect(`/courses/${req.params.id}`);
}
module.exports.deleteRating = async (req,res) => {
    const deletedRating = await Rating.findByIdAndDelete(req.params.ratingID);
    await Notification.findOneAndDelete({
        rating: req.params.ratingID, 
    });
    res.redirect(`/courses/${req.params.id}`);
}