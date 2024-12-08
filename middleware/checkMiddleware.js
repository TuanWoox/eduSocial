const Question = require('../models/question');
const Post = require('../models/Post');
const Course = require('../models/course');
const Comment = require('../models/comment');
const User = require('../models/User');
const Rating = require('../models/rating');
const Notification = require('../models/notification');
const mongoose = require('mongoose');
module.exports.isLoggedIn = (req,res,next) => {
    //isAuthenticated() is used to check if the cookie for the session is still valid!
    if(!req.isAuthenticated())
        {
            req.session.returnTo = req.originalUrl; 
            req.flash('error','Bạn chưa đăng nhập!!!');
            return res.redirect('/account/login');
        }
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isAuthorOfQuestion = async (req,res,next) => {
    const question = await Question.findById(req.params.id);
    if(!question.author.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/questions/${question._id}`);
    }
    next();
}
module.exports.isAuthorOfQuestionComment = async (req,res,next) => {
    const questionComment = await Comment.findById(req.params.commentID);
    if(!questionComment.author.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/questions/${req.params.id}`);
    }
    next();
}
module.exports.isAuthorOfPost = async (req,res,next) => {
    const post = await Post.findById(req.params.id);
    if(!post.author.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/posts/${req.params.id}`);
    }
    next();
}
module.exports.isAuthorOfPostComment = async (req,res,next) => {
    const postComment = await Comment.findById(req.params.commentID);
    if(!postComment.author.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/posts/${req.params.id}`);
    }
    next();
}
module.exports.isAuthorOfCourse = async (req,res,next) => {
    const course = await Course.findById(req.params.id);
    if(!course.author.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/courses/${req.params.id}`);
    }
    next();
}
module.exports.isYou = async (req,res,next) => {
    const user = await User.findById(req.params.id)
    if(!user.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/users/${req.params.id}`);
    }
    next();
}
module.exports.isYourNotification = async (req,res,next) => {
    const notification = await Notification.findById(req.params.id)
    if(!notification.recipient.equals(req.user._id))
    {
        console.log('hehehe')
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/users/${req.user_id}`);
    }
    next();
}
module.exports.isNotAuthorOfTheCourse = async (req,res,next) => {
    const course = await Course.findById(req.params.id);
    if(course.author.equals(req.user._id))
    {
        req.flash('error', 'Không thể đánh giá khóa học của chính mình');
        return res.redirect(`/courses/${req.params.id}`);
    }
    next();
}
module.exports.isEnrolledInTheCourse = async (req,res,next) => {
    const course = await Course.findById(req.params.id);
    let isEnrolled = false;
    course.studentsEnrolled.forEach((student) => {
        if(student.equals(req.user._id)) isEnrolled = true;
    })
    if(isEnrolled === false)
    {
        req.flash('error', 'Bạn không có quyền để đánh giá khóa học!!');
        return res.redirect(`/courses/${req.params.id}`);
    }
    next();
}
module.exports.isRatedByCurrentUser = async (req,res,next) => {
    const rating = await Rating.findOne({author: req.user._id, courseRated: req.params.id });
    if(rating){
        req.flash('error', 'Bạn đã đánh giá khóa học này rồi');
        return res.redirect(`/courses/${req.params.id}`);
    }
    next();
}
module.exports.isAuthorOfRating = async (req,res,next) => {
    const rating = await Rating.findById(req.params.ratingID);
    if(!rating.author.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền làm như thế');
        return res.redirect(`/courses/${req.params.id}`);
    }
    next();
}
module.exports.isYou = async (req,res,next) => {
    const isYou = req.user.equals(req.params.id);
    if(!isYou)
    {
        req.flash('error', 'Bạn không có quyền làm như thế');
        return res.redirect(`/users/${req.params.id}`);
    }
    next();
}