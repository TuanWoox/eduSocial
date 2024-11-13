const express = require('express');
const router = express.Router({mergeParams: true});
const accountControl = require('../controllers/account');
const passport = require('passport')
const {storeReturnTo,isLoggedin} = require('../middleware/checkMiddleware');



router.route('/register')
.get(accountControl.renderRegisterForm)
.post(accountControl.createLocalUser)

router.route('/login/googleAuth')
.get(passport.authenticate('google', { scope: ['profile', 'email'] }))

router.route('/login/googleAuth/callback')
.get(
    storeReturnTo,
    passport.authenticate('google', { failureRedirect: '/login' }),
    accountControl.loginUser
);



router.route('/login/githubAuth')
.get(passport.authenticate('github'));

router.route('/login/githubAuth/callback')
.get(
  storeReturnTo,
  passport.authenticate('github', { failureRedirect: '/login' }),
  accountControl.loginUser
);

router.route('/login')
.get(accountControl.renderLoginForm)
.post(
  storeReturnTo,
  passport.authenticate('local',{failureFlash: true, failureRedirect:'/users/login'}),
  accountControl.loginUser
)

// Google authentication (GET)

router.route('/logout')
.get(accountControl.logoutUser)



module.exports = router;