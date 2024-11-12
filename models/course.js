const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Correctly extract Schema

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    coursethumbnail: {
      url: {
        type: String
      },
      filename: {
        type: String
      }
    },
    lessons: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Lesson',
        }      
    ],
    studentsEnrolled: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    studentCount: {
      type: Number,
      default: 0
    },
    topic: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
