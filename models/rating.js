const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    courseRated: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
}, 
{
    timestamps: true
})


module.exports = mongoose.model('Rating', ratingSchema);