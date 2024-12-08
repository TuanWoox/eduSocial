const express = require('express');
const router = express.Router({mergeParams: true});
const chatControl = require('../controllers/chat');
const passport = require('passport')
const {storeReturnTo} = require('../middleware/checkMiddleware');



router.route('/save-chat')
.post(chatControl.saveChat)


router.route('/history/:id')
.get(chatControl.showHistory)

router.route('/:id')
.get(chatControl.showMessage);



module.exports = router;