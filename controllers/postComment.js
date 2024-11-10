const Post = require('../models/Post');
const postComment = require('../models/postcomment');

const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}
module.exports.sendAnswer = async (req, res) => {
    const id = req.params.id;;
    const newPostComment = new postComment({
        ...req.body.answer, 
        commentedOnPost: id,
    });
    const post = await Post.findById(id);
    if (!post) {
        return res.status(404).send("Post not found");
    }
    post.comments.push(newPostComment._id); // Push the comment ID
    await newPostComment.save();
    await post.save();
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