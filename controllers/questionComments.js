const Question = require('../models/question')
const QuestionComment = require('../models/questioncomment');

const topic = {
    title: 'Hỏi đáp',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'câu hỏi'
}
module.exports.sendAnswer = async (req, res) => {
    const id = req.params.id;
    const { body, replyTo } = req.body.answer;
    // Initialize the new comment data object with required fields
    const newQuestionCommentData = {
        commentedOnQuestion: id,
        author: req.user._id,
        body, // Always include the body
    };
    // Only include replyTo if it's not an empty string
    if (replyTo && replyTo !== '') {
        newQuestionCommentData.replyTo = replyTo;
    }
    // Create the new question comment
    const newQuestionComment = new QuestionComment(newQuestionCommentData)
    const question = await Question.findById(id);
    question.comments.push(newQuestionComment._id); // Push the comment ID
    await newQuestionComment.save();
    await question.save();

    res.redirect(`/questions/${id}`);
};
module.exports.formEditAnswer = async (req,res) => {
    const id = req.params.commentID;
    const comment = await QuestionComment.findById(id); // Pass id directly
    res.render('questions/editQuestionComment', {topic,comment});
}
module.exports.editAnswer = async (req, res) => {
    const  id = req.params.commentID; 
    const updatedData = req.body; 
    const answer = await QuestionComment.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
    res.redirect(`/questions/${answer.commentedOnQuestion}`);
};
module.exports.deleteAnswer = async (req,res) => {
    const answerid = req.params.commentID;
    const questionid = req.params.id;
    await Question.findByIdAndUpdate( 
        questionid,
        { $pull: { comments:answerid } }, // Remove the comment with the specific ID
        { new: true } // Return the updated document
    )
    await QuestionComment.findByIdAndDelete(answerid);
    res.redirect(`/questions/${questionid}`);
}