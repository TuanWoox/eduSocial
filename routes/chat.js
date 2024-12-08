const express = require('express');
const router = express.Router({mergeParams: true});
const chatControl = require('../controllers/chat');
const passport = require('passport')
const {storeReturnTo} = require('../middleware/checkMiddleware');
const {isLoggedIn,isYou} = require('../middleware/checkMiddleware')


router.route('/save-chat')
.post(isLoggedIn,chatControl.saveChat)


router.route('/history/:id')
.get(isLoggedIn,isYou,chatControl.showHistory)

router.route('/:id')
.get(isLoggedIn,chatControl.showMessage);



module.exports = router;