const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comment');
const Tag = require('./tag');
const questionSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    }],
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    //lưu comment
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'QuestionComment'  
  }],
    views : {
        type: Number,
        default: 0
    },
},
    {timestamps: true}
);

questionSchema.post('findOneAndDelete', async function(question) {
  if (question) {
    try {
      // Delete associated comments for the question
      await Comment.deleteMany({ commentedOnQuestion: question._id });

      // Delete tags where the question ID is part of the questionsTagged array
      await Tag.updateMany(
        { questionsTagged: { $in: [question._id] } },  // Find tags that have question._id in their questionsTagged array
        { $pull: { questionsTagged: question._id } }  // Pull (remove) question._id from the questionsTagged array
      );
    } catch (error) {
      console.error('Error in post findOneAndDelete hook:', error);
    }
  }
});

  
module.exports = mongoose.model('Question', questionSchema)