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
module.exports.viewUserCourses = async (req, res) => {
    const perPage = 10; // Number of courses per page
    const page = req.query.page || 1; // Default to page 1 if no page query parameter
    const topicSearch = req.query.topicSearch || 'Lập trình'; // Default topic: 'Lập trình'
    const sortBy = req.query.sortBy || 'highestRated'; // Default sort: 'highestRated'
    const searchQuery = req.query.search || ''; // Capture search parameter

    // Build filter options
    let query = {};
    if (topicSearch) {
        query.topic = topicSearch; // Filter by selected topic
    }
    if (searchQuery) {
        query.title = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search by title
    }

    // Define the sorting criteria
    let sortOptions = {};
    if (sortBy === 'activity') {
        sortOptions = { updatedAt: -1 }; // Sort by last updated date
    } else if (sortBy === 'student') {
        sortOptions = { studentCount: -1 }; // Sort by number of students enrolled
    } else if (sortBy === 'highestRated') {
        // Aggregate by average rating for each course and then sort by it
        const courses = await Course.aggregate([
            {
                $match: query // Apply filters (topicSearch, searchQuery)
            },
            {
                $lookup: {
                    from: 'ratings', // Join with Rating collection
                    localField: '_id',
                    foreignField: 'courseRated',
                    as: 'ratings'
                }
            },
            {
                $addFields: {
                    averageRating: {
                        $avg: "$ratings.rating" // Calculate the average rating for each course
                    }
                }
            },
            {
                $sort: { averageRating: -1 } // Sort courses by average rating in descending order
            },
            {
                $skip: (perPage * page) - perPage // Pagination
            },
            {
                $limit: perPage // Limit results to perPage
            }
        ]);

        // Get total number of courses for pagination
        const count = await Course.countDocuments(query);
        
        return res.render('users/courseUserShow', {
            topic,
            topicSearch,
            sortBy,
            courses,
            searchQuery,
            currentPage: page,
            totalPages: Math.ceil(count / perPage),
        });
    }

    // If not sorted by highestRated, just query normally
    const courses = await Course.find({ author: req.params.id, topic: topicSearch })
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort(sortOptions);

    // Get total number of courses for pagination
    const count = await Course.countDocuments(query);
    
    res.render('users/courseUserShow', {
        topic,
        topicSearch,
        sortBy,
        courses,
        searchQuery,
        currentPage: page,
        totalPages: Math.ceil(count / perPage),
    });
};
module.exports.coursesParticipated = async (req,res) => {
    const user = await User.findById(req.params.id)
    .populate('coursesProgress.courseId')
    res.render('users/courseParticipated', {
        topic,
        user
    })
}

