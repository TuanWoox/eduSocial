const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comment');
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
      type: String
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
  if(question){
      await Comment.deleteMany({
        commentedOnQuestion: question._id
      })
  }
})
  
module.exports = mongoose.model('Question', questionSchema)