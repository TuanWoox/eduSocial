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
    type:{
        type: String,
        required: false
    },
    content:{
        type: String,
        required: [true,'Hãy nhập nội dung bài viết']
    },
    like:{
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
    }]
});
const Post = mongoose.model('Post',PostSchema);
module.exports = Post;
