const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true // Add index for optimized queries
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        },
        question: {
            type: Schema.Types.ObjectId,
            ref: 'Question'
        },
        course: { // Fix typo here
            type: Schema.Types.ObjectId,
            ref: 'Course'
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            required: false
        },
        rating: {
            type: Schema.Types.ObjectId,
            ref: 'Rating'
        },
        message: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Create a compound index for recipient and createdAt
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
