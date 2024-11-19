const User = require('../models/User');
const Question = require('../models/question');
const Post = require('../models/Post');
const Course = require('../models/course');
const { cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Trang cá nhân',
    description: 'Khám phá trang cá nhân của người khác!',
    find: 'trang cá nhân'
}
module.exports.viewAUserInfo = async (req,res) => {
    const user = await User.findById(req.params.id);
    const numberOfQuestion = await Question.countDocuments({author: req.params.id});
    const numberOfPost = await Post.countDocuments({author: req.params.id});
    const numberOfCourse = await Course.countDocuments({author: req.params.id});
    
    res.render('users/show', {
        topic,
        user,
        numberOfQuestion,
        numberOfPost,
        numberOfCourse
    })
}
module.exports.renderEditForm = async (req,res) => {
    const user = await User.findById(req.params.id);
    res.render('users/edit',{
        topic,
        user
    })
}
module.exports.editUser = async (req,res) => {
    const {name,bio,dateOfBirth,facebook,github,linkedin} = req.body.user;
    const updatedData = {
        name,
        dateOfBirth,
        bio,
        socialLinks: {
            facebook,
            github,
            linkedin
        }
    }
    const user = await User.findByIdAndUpdate(req.params.id,updatedData,{ new: true, runValidators: true })
    {
        cloudinary.uploader.destroy(user.profilePic.filename);
        user.profilePic = {url: req.file.path, filename: req.file.filename}
        await user.save();
    }
    req.flash('success', 'Cập nhật thành công!!')
    res.redirect(`/users/${req.params.id}`);
}
module.exports.viewUserQuestions = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const questionsPerPage = 15;

    // Default sorting by newest
    let sortBy = { createdAt: -1 };  // Sorting by newest by default
    let sort = 'newest'; // Default sort option

    // Check if sorting by views is requested
    if (req.query.sort === 'views') {
        sortBy = { views: -1 };  // Sort by views in descending order
        sort = 'views';
    }

    // Fetch questions with the selected sort order
    const questions = await Question.find({author: req.params.id}).populate({
        path: 'author',
        select: 'name _id'
    })
    .sort(sortBy)  // Apply the sorting
    .skip((page - 1) * questionsPerPage)  // Skip questions for previous pages
    .limit(questionsPerPage);  // Limit to the number of questions per page

    // Get the total count of questions for pagination
    const totalQuestion = await Question.countDocuments();
    const totalPages = Math.ceil(totalQuestion / questionsPerPage);

    // Render the page with the necessary data
    res.render('users/questionUserShow', {
        topic,
        questions,
        currentPage: page,
        totalPages,
        sort  // Pass the current sort option to the template
    });
}
module.exports.viewUserPosts = async (req,res) => {
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 15;

    // Default sorting by newest
    let sortBy = { createdAt: -1 };  // Sorting by newest by default
    let sort = 'newest'; // Default sort option

    // Check if sorting by views is requested
    if (req.query.sort === 'views') {
        sortBy = { views: -1 };  // Sort by views in descending order
        sort = 'views';
    }
     // Check if sorting by activity is requested
    if(req.query.sort ==='activity')
    {
        sortBy = {updatedAt: -1};
        sort = 'activity'
    }

    // Fetch post with the selected sort order
    const post = await Post.find({author: req.params.id}).populate({
        path: 'author',
        select: 'name _id'
    })
    .sort(sortBy)  // Apply the sorting
    .skip((page - 1) * postsPerPage)  // Skip post for previous pages
    .limit(postsPerPage);  // Limit to the number of post per page

    // Get the total count of posts for pagination
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    // Render the page with the necessary data
    res.render('users/postUserShow', {
        topic,
        post,
        currentPage: page,
        totalPages,
        sort  // Pass the current sort option to the template
    });
}
module.exports.viewUserCourses = async (req,res) => {
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
    const courses = await Course.find({author: req.params.id,topic: topic})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort(sortOptions);
    // Get total number of courses for pagination
    const count = await Course.countDocuments(query);
    // Render the page with courses, topic, and pagination info
    res.render('users/courseUserShow', {
        topic,
        sortBy,
        courses,
        currentPage: page,
        totalPages: Math.ceil(count / perPage),
    });
}

