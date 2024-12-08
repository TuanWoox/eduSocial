const express = require('express');
const router = express.Router({mergeParams: true});
const accountControl = require('../controllers/account');
const passport = require('passport')
const {storeReturnTo} = require('../middleware/checkMiddleware');



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
// router.route('/login')
//   .get(accountControl.renderLoginForm) // Render the login form
//   .post(
//     storeReturnTo, // Store the return URL before login
//     accountControl.loginUser // Handle the login manually
//   );

//OTP
router.route('/forgotPassword')
.get(accountControl.showForgotForm)
.post(accountControl.forgotPassword);

router.route('/verify-otp')
.get(accountControl.showVerifyForm)
.post(accountControl.verifyOtp);

router.route('/reset-password')
.get(accountControl.showResetForm)
.post(accountControl.resetPassword);

// Google authentication (GET)

router.route('/logout')
.get(accountControl.logoutUser)



module.exports = router;