// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config(); // Load .env only in development mode
}

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const connectFlash = require('connect-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require('ejs-mate');
const dotenv = require('dotenv');

// Load Config
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Passport configuration
require('./config/passport')(passport);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Set up view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(methodOverride('_method')); // Allow method override for PUT and DELETE
app.use(cookieParser()); // Parse cookies
app.use(connectFlash()); // Flash message middleware

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// // Logging middleware for request timing
// app.use((req, res, next) => {
//   console.log('Time:', new Date().toISOString());
//   next();
// });

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const questionRoutes = require('./routes/question');
const postRoutes = require('./routes/post');
const imageHandlerRoutes = require('./routes/imageHandler');

// Routes setup
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
app.get('/', (req, res) => res.render('home'));
app.use('/api/imageHandler', imageHandlerRoutes);
app.use('/api', authRoutes);
app.use('/user', userRoutes);
app.use('/courses', courseRoutes);
app.use('/questions', questionRoutes);
app.use('/posts', postRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
