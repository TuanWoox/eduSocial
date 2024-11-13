const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    body : {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0,
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    commentedOnPost: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    commentedOnQuestion: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
    }
}, { timestamps: true });
module.exports = mongoose.model('Comment', commentSchema);
