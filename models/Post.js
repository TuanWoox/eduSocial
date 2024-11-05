const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { cloundinary, cloudinary } = require('../cloudinary/postCloud');

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
    images : [ {
        url: 
        {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        }
    }]
});
// PostSchema.post('save', function (next) {
//     console.log('New post created');
//     next(); 
// });
const Post = mongoose.model('Post',PostSchema);

module.exports = Post;
