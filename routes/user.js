const express = require('express');
const router = express.Router({mergeParams: true});
const userControl = require('../controllers/user');
const CatchAsync = require('../utils/CatchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const {storeReturnTo,isLoggedIn,isYou} = require('../middleware/checkMiddleware');
const {validateUser} = require('../middleware/validateMiddleware');



router.route('/:id/edit')
.get(isLoggedIn,isYou,CatchAsync(userControl.renderEditForm))
.post(isLoggedIn,isYou,upload.single('profilePic'),validateUser,CatchAsync(userControl.editUser))

router.route('/:id/questions')
.get(CatchAsync(userControl.viewUserQuestions))

router.route('/:id/posts')
.get(CatchAsync(userControl.viewUserPosts))

router.route('/:id/courses')
.get(CatchAsync(userControl.viewUserCourses))

router.route('/:id')
.get(CatchAsync(userControl.viewAUserInfo));



module.exports = router;