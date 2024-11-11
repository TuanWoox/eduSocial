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
    currentLesson: 
    { 
      type: Number 
    }, 
    lastAccessed: 
    { 
      type: Date, default: Date.now 
    }
    }
  ],
  questions : 
  [
    {
    type: Schema.Types.ObjectId,
    ref: 'Question'
    }
  ],
  own_series : 
  [
    {
      type: Schema.Types.ObjectId,
      ref: 'Series'
    }
  ]
},
  {timestamps: true}
);

//This adds in username and password and make username unique
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
