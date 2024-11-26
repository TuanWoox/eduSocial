const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comment');
const postSchema = new Schema({
    name:{
        type: String,
        required: false,
        default: 'no name'
    },
    title:{
        type: String,
        required: [true , 'Hãy nhập tựa đề bài viết']
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag',
    }]
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

postSchema.post('findOneAndDelete', async function(post) {
    if(post){
        await Comment.deleteMany({
          commentedOnPost: post._id
        })
    }
})

module.exports =  mongoose.model('Post',postSchema);