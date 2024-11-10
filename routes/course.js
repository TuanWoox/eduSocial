const express = require('express');
const router = express.Router({mergeParams: true});
const CatchAsync = require('../utils/CatchAsync');
const courseControl = require('../controllers/course');
const multer = require('multer');
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
router.route('/')
.get(CatchAsync(courseControl.index))

router.route('/create')
.get(courseControl.createForm)
.post(upload.single('coursethumbnail'),CatchAsync(courseControl.createCourse))

router.route('/:id/edit')
.get(CatchAsync(courseControl.viewEditCourseInfoForm))
.post(upload.single('coursethumbnail'),CatchAsync(courseControl.editCourseInfomation))

router.route('/:id/createLesson')
.get(courseControl.createLessonForm)
.post(CatchAsync(courseControl.createLesson))

router.route('/:id/:lessonID/edit')
.get(CatchAsync(courseControl.editLessonForm))

router.route('/:id/:lessonID')
.get(CatchAsync(courseControl.viewALesson))
.put(CatchAsync(courseControl.updateLesson))
.delete(CatchAsync(courseControl.deleteLesson))


router.route('/:id')
.get(CatchAsync(courseControl.viewACourse))
.delete(CatchAsync(courseControl.deleteCourse))

module.exports = router