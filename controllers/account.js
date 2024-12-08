const User = require('../models/User');
const Otp = require('../models/otp');
const transporter = require('../otp/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generatePasswordHash(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { salt, hash };
}
// Hàm xác thực mật khẩu
function validatePassword(password, salt, hash) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}
module.exports.renderRegisterForm = (req,res) => {
    res.render('accounts/registerForm')
}
module.exports.createLocalUser = async (req,res,next) => {
     try {
        const {username,password,name,dateOfBirth} = req.body;
        const dateOfBirthConvert = new Date(dateOfBirth);
        const user = new User({username,name,dateOfBirthConvert});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err)
            req.flash('success', 'Welcome to our website')
            return res.redirect('/courses');
        })
    } catch (e) {
        return res.redirect('/register');
    }

    //Tạo `salt` và `hash` cho mật khẩu mới
//     const { salt, hash } = generatePasswordHash(password);
//     const user = new User({ username, name, dateOfBirth: dateOfBirthConvert, salt, hash });
    
//     await user.save();
//     req.login(user, (err) => {
//         if (err) return next(err);
//         req.flash('success', 'Welcome to our website');
//         return res.redirect('/courses');
//     });
// } catch (e) {
//     return res.redirect('/register');
// }
}
module.exports.loginUser = async (req, res) => {
    req.flash('success', 'Welcome back!!');
    const redirectUrl = res.locals.returnTo || '/courses';
    // Reset returnTo from session if it exists
    if (req.session.returnTo) {
        delete req.session.returnTo;
    }
    // Clear returnTo from res.locals for the current request
    res.locals.returnTo = '';
    // Redirect to the chosen URL
    res.redirect(redirectUrl);

    // const { username, password } = req.body;

    // // Validate if username and password are provided
    // if (!username || !password) {
    //   return res.status(400).send('Username and password are required.');
    // }
  
    // try {
    //   // Find the user in the database by username
    //   const user = await User.findOne({ username: username.trim() });
  
    //   // If user is not found or password is incorrect, send an error
    // if (!user) {
    //     return res.status(401).send('Thông tin đăng nhập không chính xác.');
    //   }
  
    //   // If authentication is successful, store user information in the session
    //   req.session.user = { id: user._id, username: user.username }; // You can store more user details as needed
  
    //   // Set flash message
    //   req.flash('success', 'Welcome back!!');
  
    //   // Check if there's a returnTo URL, otherwise redirect to the default page
    //   const redirectUrl = res.locals.returnTo || '/courses';
  
    //   // Reset the returnTo session after login
    //   if (req.session.returnTo) {
    //     delete req.session.returnTo;
    //   }
    //   // Clear returnTo in locals for the current request
    //   res.locals.returnTo = '';
    //   // Redirect to the appropriate URL
    //   res.redirect(redirectUrl);
    // } catch (error) {
    //   // Handle any errors that occur during the login process
    //   console.error(error);
    //   return res.status(500).send('An error occurred during the login process.');
    // }
};

module.exports.renderLoginForm = (req,res) => { 
    res.render('accounts/loginForm');
}

//OTP
module.exports.showForgotForm = (req,res) =>{
    res.render('accounts/forgotPassword');
}
module.exports.showVerifyForm = (req,res) =>{
    res.render('accounts/otpForm');
}
module.exports.showResetForm = (req,res) =>{
    res.render('accounts/resetPassword');
}

module.exports.forgotPassword = async (req,res) =>{
  const { username } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).send('Email không tồn tại.');

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  await new Otp({ username, otp, expiresAt }).save();

  await transporter.sendMail({
    to: username,
    subject: 'OTP đặt lại mật khẩu',
    text: `Mã OTP của bạn là: ${otp}`,
  });

  res.render('accounts/otpForm', { username });
}
module.exports.verifyOtp = async (req, res) => {
    const { username, otp } = req.body;
    const otpDoc = await Otp.findOne({ username, otp });
  
    if (!otpDoc || otpDoc.expiresAt < Date.now()) {
      return res.status(400).send('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }
  
    res.render('accounts/resetPassword', { username });
};

module.exports.resetPassword = async (req, res) => {
    const { username, password } = req.body;
    const { salt, hash } = generatePasswordHash(password);

    // Cập nhật mật khẩu trong cơ sở dữ liệu với `salt` và `hash` mới
    const updateResult = await User.updateOne(
        { username },
        { salt: salt, hash: hash }
    );

    if (updateResult.nModified === 0) {
      return res.status(500).send('Không thể cập nhật mật khẩu.');
    }

    await Otp.deleteOne({ username });
    res.render('accounts/sucessReset');
};


//Logout
module.exports.logoutUser = (req,res,next)=> {
    req.logOut(function(err) {
        if(err){
            return next(err);
        }
    })
    res.redirect('/');
}