const Course = require('../models/course')
const Lesson = require('../models/lessson');
const { cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Tất cả khóa học',
    description: 'Hàng trăm khóa học miễn phí được xây dựng bởi EduSocial và cộng đồng!',
    find: 'câu khóa học'

}
module.exports.index = async (req,res) => {
    const courses = await Course.find({});
    res.render('courses/index',{topic,courses})
}
module.exports.createForm = async (req,res) => {
    res.render('courses/createCourse', {topic});
}
module.exports.createCourse = async (req,res) => {
    const tagsArray = req.body.course.tags.split(' ').filter(tag => tag.trim() !== '');
    const newCourse = new Course({
        ...req.body.course,
        tags: tagsArray
    });
    newCourse.coursethumbnail = {url: req.file.path, filename: req.file.filename}
    await newCourse.save();
    res.redirect(`/courses/${newCourse.id}`);
}
module.exports.viewACourse = async (req,res) => {
    const viewedCourse = await Course.findById(req.params.id)
    .populate('lessons', 'title _id');
    res.render('courses/showCourse', {topic, viewedCourse});
}
module.exports.viewEditCourseInfoForm = async (req,res) => {
    const id = req.params.id;
    const course = await Course.findById(id);
    if(course)
    {
        res.render('courses/editCourseInfo', {course, topic})
    } else res.redirect('/courses');
    
}
module.exports.editCourseInfomation = async (req,res) => {
    const id = req.params.id;
    const tagsArray = req.body.course.tags.split(' ').filter(tag => tag.trim() !== '');
    const newData = {
        title: req.body.course.title,
        description: req.body.course.description,
        tags: tagsArray
    }
    const course = await Course.findByIdAndUpdate(id,newData,{ new: true, runValidators: true })
    if(req.file)
    {
        cloudinary.uploader.destroy(course.coursethumbnail.filename);
        course.coursethumbnail = {url: req.file.path, filename: req.file.filename}
    } 
    await course.save();
    return res.redirect(`/courses/${course.id}`);
}
module.exports.deleteCourse = async (req,res) => {
    const id = req.params.id;
    const deletedCourse = await Course.findByIdAndDelete(id);
    await cloudinary.uploader.destroy(deletedCourse.coursethumbnail.filename);
    for(let lesson of deletedCourse.lessons)
    {
        const deletedLesson = await Lesson.findByIdAndDelete(lesson);
        for(let image of deletedLesson.images)
        {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
    res.redirect('/courses');
}

module.exports.createLessonForm = (req,res) => {
    const courseID = req.params.id;
    res.render('courses/createLesson', {topic, courseID});
}
module.exports.createLesson = async (req,res) => {
    const courseID = req.params.id;
    const course = await Course.findById(courseID);
    const {title,content,images} = req.body.course;
    const imagesParsed = JSON.parse(images);
    const newLesson = new Lesson({
        title,
        content,
        images: imagesParsed,
        lessOfCourse: courseID
    })
    await newLesson.save();
    course.lessons.push(newLesson._id);
    await course.save();
    return res.redirect(`/courses/${courseID}`);
}
module.exports.viewALesson = async (req, res) => {
    const courseID = req.params.id;
    const lessonID = req.params.lessonID;

    // Fetch the current lesson
    const lesson = await Lesson.findById(lessonID);

    // Ensure the 'lesson' exists
    if (!lesson) {
        return res.status(404).send("Lesson not found");
    }

    // Fetch the previous lesson based on 'createdAt' timestamp, only fetching the _id
    const previousLesson = await Lesson.findOne({
        lessOfCourse: courseID,
        createdAt: { $lt: lesson.createdAt }  // Lessons created before the current lesson
    }).select('_id');  // Only select the _id field

    // Fetch the next lesson based on 'createdAt' timestamp, only fetching the _id
    const nextLesson = await Lesson.findOne({
        lessOfCourse: courseID,
        createdAt: { $gt: lesson.createdAt }  // Lessons created after the current lesson
    }).select('_id');  // Only select the _id field

    // Extract just the _id if previousLesson and nextLesson are found
    const previousLessonId = previousLesson ? previousLesson._id : null;
    const nextLessonId = nextLesson ? nextLesson._id : null;

    res.render('courses/viewLesson', { courseID, lesson, previousLessonId, nextLessonId, topic });
};

module.exports.editLessonForm = async (req,res) => {
    const courseID = req.params.id;
    const lessonID = req.params.lessonID;
    const lesson = await Lesson.findById(lessonID);
    res.render('courses/editLesson', {topic, courseID, lesson});
}

module.exports.updateLesson = async (req,res) => {
    const id = req.params.id;
    const lessonID = req.params.lessonID;
    const newData = {
        title: req.body.course.title,
        content: req.body.course.content,
    }
    const lesson = await Lesson.findByIdAndUpdate(lessonID, newData, { new: true, runValidators: true });
    const imgs = JSON.parse(req.body.newImages);
    lesson.images.push(...imgs);
    await lesson.save();
    const deletedImages = JSON.parse(req.body.deletedImages);
    if(deletedImages)
        {
            for(let filename of deletedImages )
            {
                await cloudinary.uploader.destroy(filename);
            }
            await Lesson.updateOne({$pull: {images: {filename: {$in: deletedImages}}}});
    }
    res.redirect(`/courses/${id}/${lessonID}`);
}

module.exports.deleteLesson = async (req,res) => {
    const courseID = req.params.id;
    const lessonID = req.params.lessonID;
    const deleteLesson = await Lesson.findByIdAndDelete(lessonID);
    for(const image of deleteLesson.images) {
        await cloudinary.uploader.destroy(image.filename);
    }

    await Course.findByIdAndUpdate(courseID, {
        $pull: {
            lessons: lessonID
        }
    })
    res.redirect(`/courses/${courseID}`);
}

