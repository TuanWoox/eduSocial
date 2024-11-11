const express = require('express');
const router = express.Router({mergeParams: true});
const userControl = require('../controllers/user');
const passport = require('passport')
const {storeReturnTo,isLoggedin} = require('../middleware/checkMiddleware');



router.route('/register')
.get(userControl.renderRegisterForm)
.post(userControl.createLocalUser)

router.route('/login/googleAuth')
.get(passport.authenticate('google', { scope: ['profile', 'email'] }))

router.route('/login/googleAuth/callback')
.get(
    storeReturnTo,
    passport.authenticate('google', { failureRedirect: '/login' }),
    userControl.loginUser
);



router.route('/login/githubAuth')
.get(passport.authenticate('github'));

router.route('/login/githubAuth/callback')
.get(
  storeReturnTo,
  passport.authenticate('github', { failureRedirect: '/login' }),
  userControl.loginUser
);

router.route('/login')
.get(userControl.renderLoginForm)
.post(
  storeReturnTo,
  passport.authenticate('local',{failureFlash: true, failureRedirect:'/users/login'}),
  userControl.loginUser
)

// Google authentication (GET)



router.route('/logout')
.get(userControl.logoutUser)

router.route('/')
.get(userControl.renderHome)

module.exports = router;