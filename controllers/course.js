const Course = require('../models/course')
const Lesson = require('../models/lessson');
const User = require('../models/User');
const { cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Tất cả khóa học',
    description: 'Hàng trăm khóa học miễn phí được xây dựng bởi EduSocial và cộng đồng!',
    find: 'câu khóa học'

}

module.exports.index = async (req, res) => {
    const perPage = 10; // Number of courses per page
    const page = req.query.page || 1; // Default to page 1 if no page query parameter
    const topic = req.query.topic || 'Lập trình'; // Default topic: 'IT & Phần mềm'
    const sortBy = req.query.sortBy || 'createdAt'; // Default sort: 'createdAt'
    // Build filter and sort options
    let query = { };
    if (topic) {
        query.topic = topic; // Filter by selected topic
    }
    // Determine the sorting criteria
    let sortOptions = {};
    if (sortBy === 'createdAt') {
        sortOptions = { createdAt: -1 }; // Sort by creation date, newest first
    } else if (sortBy === 'activity') {
        sortOptions = { updatedAt: -1 }; // Sort by last updated date
    } else if(sortBy === 'student') {
        sortOptions = { studentCount : -1}
    }
    // Get courses with the filtering and sorting applied
    const courses = await Course.find({topic: topic})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort(sortOptions);
    // Get total number of courses for pagination
    const count = await Course.countDocuments(query);
    // Render the page with courses, topic, and pagination info
    res.render('courses/index', {
        topic,
        sortBy,
        courses,
        currentPage: page,
        totalPages: Math.ceil(count / perPage),
    });
};



module.exports.createForm = async (req,res) => {
    res.render('courses/createCourse', {topic});
}
module.exports.createCourse = async (req,res) => {
    const newCourse = new Course({
        ...req.body.course,
        author: req.user._id
    });
    if (req.file) {
        newCourse.coursethumbnail = {
            url: req.file.path,
            filename: req.file.filename
        };
    } 
    await newCourse.save();
    res.redirect(`/courses/${newCourse.id}`);
}
module.exports.viewACourse = async (req,res) => {
    const viewedCourse = await Course.findById(req.params.id)
    .populate('lessons', 'title _id')
    .populate('author', 'name _id own_courses profilePic')
    const authorNumberOfCourse = await Course.countDocuments({author: viewedCourse.author})
    res.render('courses/showCourse', {topic, viewedCourse,authorNumberOfCourse });
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
    console.log(req.body);
    const newData = {
        title: req.body.course.title,
        description: req.body.course.description,
        topic: req.body.course.topic
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
     // Find users who have the deleted course in their coursesProgress array
     const users = await User.find({
        'coursesProgress.courseId': id // Match the courseId in coursesProgress array
    });

    // Loop through all users and remove the deleted course from their coursesProgress array
    for (let user of users) {
        // Filter out the course from the coursesProgress array
        user.coursesProgress = user.coursesProgress.filter(progress => progress.courseId.toString() !== id.toString());
        
        // Save the updated user document
        await user.save();
    }
    res.redirect('/courses');
}

