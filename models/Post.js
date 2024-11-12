const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
    name:{
        type: String,
        required: false,
        default: 'no name'
    },
    title:{
        type: String,
        required: [true , 'Hãy nhập tựa đề bài viết']
    },
    tags: [
    {
        type: String
      }
    ]
    ,
    content:{
        type: String,
        required: [true,'Hãy nhập nội dung bài viết']
    },
    upvotes: {
        type: Number,
        default: 0
      },
    downvotes: {
        type: Number,
        default: 0
    },
    views : {
        type: Number,
        default: 0
    },
    images: [{
        url: { type: String},
        filename: { type: String }
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'PostComment'  
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});
const Post = mongoose.model('Post',PostSchema);
module.exports = Post;
