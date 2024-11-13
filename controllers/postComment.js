const Comment = require('../models/comment');

const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}
module.exports.sendAnswer = async (req, res) => {
    const id = req.params.id;
    const { body, replyTo } = req.body.answer;
    const newPostCommentData = {
        commentedOnPost: id,
        author: req.user._id,
        body
    };
    if (replyTo && replyTo !== '') {
        newPostCommentData.replyTo = replyTo; 
    }
    const newPostComment = new Comment(newPostCommentData);
    await newPostComment.save();
    req.flash('success', 'Bình luận thành công');
    res.redirect(`/posts/${id}`);
};
module.exports.formEditAnswer = async (req,res) => {
    const postID = req.params.id;
    const commentID = req.params.commentID;
    const query = {
        commentedOnPost: postID,
        _id: commentID,
    };
    const comment = await Comment.findOne(query);
    res.render('posts/editPostComment', {topic,comment});
}
module.exports.editAnswer = async (req, res) => {
    const postID = req.params.id;
    const commentID = req.params.commentID;
    const query = {
        commentedOnPost: postID,
        _id: commentID,
    };
    const updatedData = {
        body: req.body.answer.body,
    };
    if (req.body.answer.replyTo && req.body.answer.replyTo !== '') {
        updatedData.replyTo = req.body.answer.replyTo;
    }
    const answer = await Comment.findOneAndUpdate(query, updatedData, { new: true, runValidators: true });
    res.redirect(`/posts/${answer.commentedOnPost}`);
};
module.exports.deleteAnswer = async (req,res) => {
    const postID = req.params.id;
    const commentID = req.params.commentID;
    const deleteReplies = async (commentId) => {
        const replies = await Comment.find({ replyTo: commentId });
        for (let reply of replies) {
            await deleteReplies(reply._id);  
        }
        await Comment.findByIdAndDelete(commentId);
    };
    await deleteReplies(commentID);
    res.redirect(`/posts/${postID}`);
}