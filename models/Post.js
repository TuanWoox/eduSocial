const mongoose = require('mongoose');
const schema = mongoose.Schema;

const PostSchema = new mongoose.Schema({
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
    url:{
        type: String,
        required: false
    },
    like:{
        type: Number,
        default: 0
    },
    views : {
        type: Number,
        default: 0
    },
    media: {
        type: String,
        required: false
    } 
});
// PostSchema.post('save', function (next) {
//     console.log('New post created');
//     next(); 
// });
const Post = mongoose.model('Post',PostSchema);
module.exports = Post;
