const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tagSchema = new Schema({
   name: {
        type: String,
        required: true,
   },
   postsTagged: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }
   ],
   questionsTagged: [
    {
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }
   ]
}, 
{timestamps: true}
)

module.exports = mongoose.model('Tag', tagSchema);