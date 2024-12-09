const Comment = require('../models/comment');
const Notification = require('../models/notification'); 
const Post = require('../models/Post');

const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}
module.exports.sendAnswer = async (req, res) => {
    const id = req.params.id;
    const { body, replyTo } = req.body.answer;

    // Tạo bình luận mới
    const newPostCommentData = {
        commentedOnPost: id,
        author: req.user._id,
        body,
    };

    let mentionedUser = null;

    if (replyTo && replyTo !== '') {
        const replyToComment = await Comment.findById(replyTo).populate('author');
        newPostCommentData.replyTo = replyTo;
        mentionedUser = replyToComment.author; // Lấy người được mention
    }

    const newPostComment = new Comment(newPostCommentData);
    await newPostComment.save();

    // Tìm chủ sở hữu bài viết
    const post = await Post.findById(id).populate('author'); // Giả định Post có field `author` là ObjectId của User
    if(!mentionedUser || post && post.author._id.toString() !== mentionedUser._id.toString())
    {
        if (post && post.author && post.author._id.toString() !== req.user._id.toString()) {
            // Tạo thông báo cho chủ sở hữu bài viết
            const postNotification = new Notification({
                recipient: post.author._id,
                sender: req.user._id,
                post: id,
                comment: newPostComment._id,
                message: `${req.user.name} đã bình luận BÀI VIẾT của bạn.`,
                isRead: false,
            });
            await postNotification.save();
        }
    }
    // Nếu có người được mention
    if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
        const mentionNotification = new Notification({
            recipient: mentionedUser._id,
            sender: req.user._id,
            post: id,
            comment: newPostComment._id,
            message: `${req.user.name} đã trả lời BÌNH LUẬN của bạn`,
            isRead: false,
        });
        await mentionNotification.save();
    }

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