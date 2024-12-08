const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    sender_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    receiver_id: {
        type: Schema.Types.ObjectId,
        required: true 
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Chat', chatSchema);