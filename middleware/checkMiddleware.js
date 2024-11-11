const Question = require('../models/question');
const QuestionComment = require('../models/questioncomment');
module.exports.isLoggedIn = (req,res,next) => {
    //isAuthenticated() is used to check if the cookie for the session is still valid!
    if(!req.isAuthenticated())
        {
            req.session.returnTo = req.originalUrl; 
            req.flash('error','Bạn chưa đăng nhập!!!');
            return res.redirect('/login');
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
    const questionComment = await QuestionComment.findById(req.params.commentID);
    if(!questionComment.author.equals(req.user._id))
    {
        req.flash('error', 'Bạn không có quyền để làm như thế!!!');
        return res.redirect(`/questions/${req.params.id}`);
    }
    next();
}
