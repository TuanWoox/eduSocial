const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LessonSchema = new Schema({
    title:{
        type: String,
        required: [true , 'Hãy nhập tựa đề bài viết']
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
    // comments: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'PostComment'  
    // }],
    lessOfCourse: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }
},
{timestamps: true}
);
const Lesson = mongoose.model('Lesson',LessonSchema);
module.exports = Lesson;
