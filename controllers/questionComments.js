const Comment = require('../models/comment');

const topic = {
    title: 'Hỏi đáp',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'câu hỏi'
}
module.exports.sendAnswer = async (req, res) => {
    const id = req.params.id;
    const { body, replyTo } = req.body.answer;
    const newQuestionCommentData = {
        commentedOnQuestion: id,
        author: req.user._id,
        body, 
    };
    if (replyTo && replyTo !== '') {
        newQuestionCommentData.replyTo = replyTo;
    }
    const newQuestionComment = new Comment(newQuestionCommentData)
    await newQuestionComment.save();
    res.redirect(`/questions/${id}`);
};
module.exports.formEditAnswer = async (req,res) => {
    const questionID = req.params.id;
    const commentID = req.params.commentID;
    const query = {
        commentedOnQuestion: questionID,
        _id: commentID,
    };
    const comment = await Comment.findOne(query);
    res.render('questions/editQuestionComment', {topic,comment});
}
module.exports.editAnswer = async (req, res) => {
    const questionID = req.params.id;
    const commentID = req.params.commentID;
    const query = {
        commentedOnQuestion: questionID,
        _id: commentID,
    };
    const updatedData = {
        body: req.body.answer.body,
    };
    if (req.body.answer.replyTo && req.body.answer.replyTo !== '') {
        updatedData.replyTo = req.body.answer.replyTo;
    }
    const answer = await Comment.findOneAndUpdate(query, updatedData, { new: true, runValidators: true });
    res.redirect(`/questions/${answer.commentedOnQuestion}`);
};
module.exports.deleteAnswer = async (req,res) => {
    const questionID = req.params.id;
    const commentID = req.params.commentID;
    const deleteReplies = async (commentId) => {
        const replies = await Comment.find({ replyTo: commentId });
        for (let reply of replies) {
            await deleteReplies(reply._id);  
        }
        await Comment.findByIdAndDelete(commentId);
    };
    await deleteReplies(commentID);
    res.redirect(`/questions/${questionID}`);
}