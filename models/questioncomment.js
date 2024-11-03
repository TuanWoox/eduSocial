const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const questionCommentSchema = new Schema({
    body : {
        type: String,
        required: true
    },
    // authorId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0,
    },
    // upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // downvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // replies: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'QuestionComment'
    // }],
    // isDeleted: {
    //     type: Boolean,
    //     default: false
    // }
    commentedOnQuestion: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('QuestionComment', questionCommentSchema);
