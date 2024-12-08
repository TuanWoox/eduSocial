const mongoose = require('mongoose');
const { isEmail } = require('validation');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = new Schema({
  githubId: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    required: false
  },
  facebookId: {
    type: String,
    required: false
  },
  name: { 
    type: String, 
    required: [true,'Hãy nhập tên'] 
  },
  dateOfBirth: {
    type: Date
  },
  bio: 
  { 
        type: String 
  },
  profilePic: 
  { 
    url: {
      type: String
    },
    filename: {
      type: String
    }
  },
  socialLinks: 
  {
      facebook: { type: String, trim: true },
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true }
  },
  coursesProgress: 
  [
    {
    courseId: 
    { 
      type: Schema.Types.ObjectId, 
      ref: 'Course' 
    },
    // currentLesson: 
    // { 
    //   type: Schema.Types.ObjectId,
    //   ref: 'Lesson'
    // }, 
    lastAccessed: 
    { 
      type: Date, default: Date.now 
    }
    }
  ],
  is_online : {
    type: Number,
  },
  messagesList : 
    [
      {
        type: Schema.Types.ObjectId,
        required: true,
      }
    ],
},
  {timestamps: true}
);

//This adds in username and password and make username unique
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
