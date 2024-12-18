// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config(); // Load .env only in development mode
}


// //require this dotenv will be for when we deploy
// require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const connectFlash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require('ejs-mate');
const sanitizeHtml = require('sanitize-html');
const MongoStore = require('connect-mongo');
const { createServer} = require('node:http');
const LocalStrategy = require('passport-local');
const passportGoogle = require('./passportAuth/passportGoogle');
const passportGithub = require('./passportAuth/passportGithub');
const ExpressError = require('./utils/ExpressError');
const dotenv = require('dotenv');
const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/eduSocial';

const User = require('./models/User');



// Initialize Express
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;


// Connect to MongoDB
mongoose.connect(dbUrl)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Set up view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce'))); // serve TinyMCE file
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(methodOverride('_method')); // Allow method override for PUT and DELETE
app.use(cookieParser()); // Parse cookies
app.use(connectFlash()); // Flash message middleware


const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  //7 days to live
  ttl: 7*24*60*60,
  crypto: {
      secret: process.env.CRYPTO_SESSION_SECRET
  }
})

store.on("error", function(e) {
  console.log('SESSION ERROR', e)
})


// Session management
app.use(session({
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    name: 'eduSocialCookie',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    //this is for when deploy with https
    //secure: true
  }
}));



// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// Local strategy for username/password login
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//This is used for google login
passport.use('google',passportGoogle);
//Tis isued for github login
passport.use('github',passportGithub)


const { Server } = require("socket.io");
const io = new Server(server);


io.on('connection', async (socket) => {
  const userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate({_id: userId}, {$set: {is_online:1}});

  socket.broadcast.emit('userOnline', userId)

  socket.on('newChat', function(data)  {
    socket.broadcast.emit('loadNewChat', data);
  })
  socket.on('disconnect', async function(){
    const userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({_id: userId}, {$set: {is_online:0}});
    socket.broadcast.emit('userOffline', userId)
  })
})





// Route imports
const accountRoutes = require('./routes/account');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const questionRoutes = require('./routes/question');
const postRoutes = require('./routes/post');
const notificationRoutes = require('./routes/notification');
const memberRoutes = require('./routes/member')
const aboutRoutes = require('./routes/about')
const imageHandlerRoutes = require('./routes/imageHandler');
const tagRoutes = require('./routes/tag');
const chatRoutes = require('./routes/chat');

//Catch flash message and user!
app.use((req,res,next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
})

// Routes setup

app.use('/account', accountRoutes);
app.use('/users',userRoutes);
app.use('/api/imageHandler', imageHandlerRoutes);
app.use('/courses', courseRoutes);
app.use('/questions', questionRoutes);
app.use('/posts', postRoutes);
app.use('/tags', tagRoutes);
app.use('/notifications',notificationRoutes);
app.use('/member',memberRoutes);
app.use('/about',aboutRoutes);
app.use('/chats', chatRoutes);

app.use('/', (req,res) => {
  res.render('home');
})

app.all('*',(req,res,next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use((err,req,res,next) => {
  const {statusCode = 500} = err;
  if(!err.message) err.message = 'Oh no, Something went wrong';
  res.status(statusCode).render('error', { err });
})

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
