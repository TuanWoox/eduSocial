const express = require('express');
const router = express.Router({mergeParams: true});
const CatchAsync = require('../utils/CatchAsync');
const courseControl = require('../controllers/course');
const lesssonControl = require('../controllers/lesson');
const multer = require('multer');
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const {isLoggedIn,isAuthorOfCourse} = require('../middleware/checkMiddleware');
const {validateCourse, validateLesson} = require('../middleware/validateMiddleware');
router.route('/')
.get(CatchAsync(courseControl.index))

router.route('/create')
.get(isLoggedIn,courseControl.createForm)
.post(isLoggedIn,upload.single('coursethumbnail'),validateCourse,CatchAsync(courseControl.createCourse))

router.route('/:id/edit')
.get(isLoggedIn,isAuthorOfCourse,CatchAsync(courseControl.viewEditCourseInfoForm))
.post(isLoggedIn,isAuthorOfCourse,upload.single('coursethumbnail'),validateCourse,CatchAsync(courseControl.editCourseInfomation))

router.route('/:id/createLesson')
.get(isLoggedIn,isAuthorOfCourse,lesssonControl.createLessonForm)
.post(isLoggedIn,isAuthorOfCourse,validateLesson,CatchAsync(lesssonControl.createLesson))

router.route('/:id/:lessonID/edit')
.get(isLoggedIn,isAuthorOfCourse,CatchAsync(lesssonControl.editLessonForm))

router.route('/:id/:lessonID')
.get(CatchAsync(lesssonControl.viewALesson))
.put(isLoggedIn,isAuthorOfCourse,validateLesson,CatchAsync(lesssonControl.updateLesson))
.delete(isLoggedIn,isAuthorOfCourse,CatchAsync(lesssonControl.deleteLesson))


router.route('/:id')
.get(CatchAsync(courseControl.viewACourse))
.delete(isLoggedIn,isAuthorOfCourse,CatchAsync(courseControl.deleteCourse))

module.exports = router