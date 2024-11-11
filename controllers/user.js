const User = require('../models/User');


module.exports.renderHome = (req,res) => {
    res.render('home');
}
module.exports.renderRegisterForm = (req,res) => {
    res.render('users/registerForm')
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
        return res.redirect('/users/register');
    }
}
module.exports.loginUser = (req,res) =>{
    req.flash('success','Welcome back!!')
    const redirectUrl = res.locals.returnTo || '/courses'
    res.redirect(redirectUrl);
}
module.exports.renderLoginForm = (req,res) => { 
    res.render('users/loginForm');
}
module.exports.logoutUser = (req,res,next)=> {
    req.logOut(function(err) {
        if(err){
            return next(err);
        }
    })
    res.redirect('/');
}