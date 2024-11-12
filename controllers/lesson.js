const Course = require('../models/course')
const Lesson = require('../models/lessson');
const User = require('../models/User');
const topic = {
    title: 'Tất cả khóa học',
    description: 'Hàng trăm khóa học miễn phí được xây dựng bởi EduSocial và cộng đồng!',
    find: 'câu khóa học'

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

    try {
        // Fetch the current lesson
        const lesson = await Lesson.findById(lessonID);

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

        // Fetch the course
        const course = await Course.findById(courseID);

        // Check if the user is not the author
        if (req.user._id && !course.author.equals(req.user._id)) {
            // Update user progress
            const user = await User.findById(req.user._id);
            // Check if the user has the course progress for the specific courseId
            const existingCourseProgress = user.coursesProgress.find(progress => progress.courseId.toString() === course._id.toString());

            if (existingCourseProgress) {
                // If progress exists, update it
                existingCourseProgress.lastAccessed = new Date();
            } else {
                // If progress doesn't exist, add a new entry
                user.coursesProgress.push({
                    courseId: course._id,
                    lastAccessed: new Date()
                });
            }
            await user.save();  // Save the user's updated progress
            course.studentsEnrolled.push(user._id);
            course.studentCount +=1;
            await course.save();
        }

        // Render the page with course and lesson info
        res.render('courses/viewLesson', { 
            courseID, 
            lesson, 
            previousLessonId, 
            nextLessonId, 
            topic: course.topic 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while viewing the lesson.");
    }
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

