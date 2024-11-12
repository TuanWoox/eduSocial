const Post = require('../models/Post');
const postComment = require('../models/postcomment');

const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}
module.exports.sendAnswer = async (req, res) => {
    const id = req.params.id;
    const { body, replyTo } = req.body.answer;
    // Initialize the object for creating the new comment
    const newPostCommentData = {
        commentedOnPost: id,
        author: req.user._id,
        body // Always include the body
    };
    // If replyTo is not an empty string, add it to the new comment data
    if (replyTo && replyTo !== '') {
        newPostCommentData.replyTo = replyTo; // Add replyTo only if it's not empty
    }
    const newPostComment = new postComment(newPostCommentData);
    //Find the post to insert the comment in
    const post = await Post.findById(id);
    //Push the comments
    post.comments.push(newPostComment._id); 
    await newPostComment.save();
    await post.save();
    req.flash('success', 'Bình luận thành công');
    res.redirect(`/posts/${id}`);
};
module.exports.formEditAnswer = async (req,res) => {
    const id = req.params.commentID;
    const comment = await postComment.findById(id); // Pass id directly
    res.render('posts/editPostComment', {topic,comment});
}
module.exports.editAnswer = async (req, res) => {
    const  id = req.params.commentID; 
    const updatedData = req.body; 
    const answer = await postComment.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
    res.redirect(`/posts/${answer.commentedOnPost}`);
};
module.exports.deleteAnswer = async (req,res) => {
    const answerid = req.params.commentID;
    const postsid = req.params.id;
    await Post.findByIdAndUpdate( 
        postsid,
        { $pull: { comments:answerid } }, // Remove the comment with the specific ID
        { new: true } // Return the updated document
    )
    await postComment.findByIdAndDelete(answerid);
    res.redirect(`/posts/${postsid}`);
}