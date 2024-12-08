const Course = require('../models/course')
const Lesson = require('../models/lessson');
const User = require('../models/User');
const Rating = require('../models/rating');
const { cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Tất cả khóa học',
    description: 'Hàng trăm khóa học miễn phí được xây dựng bởi EduSocial và cộng đồng!',
    find: 'câu khóa học',
    linkCreate: '/courses/create'
}

module.exports.index = async (req, res) => {
    const perPage = 10; // Number of courses per page
    const page = req.query.page || 1; // Default to page 1 if no page query parameter
    const topicSearch = req.query.topicSearch || 'Lập trình'; // Default topic: 'IT & Phần mềm'
    const sortBy = req.query.sortBy || 'highestRated'; // Default sort: 'highestRated'
    const searchQuery = req.query.search || ''; // Capture search parameter

    // Build filter and sort options
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
        
        return res.render('courses/index', {
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
    const courses = await Course.find({ topic: topicSearch })
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort(sortOptions);

    // Get total number of courses for pagination
    const count = await Course.countDocuments(query);
    
    res.render('courses/index', {
        topic,
        topicSearch,
        sortBy,
        courses,
        searchQuery,
        currentPage: page,
        totalPages: Math.ceil(count / perPage),
    });
};


//thêm(tìm kiếm khóa học)
module.exports.indexSearch = async (req, res) => {
    const perPage = 10; // Số khóa học trên mỗi trang
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const searchQuery = req.query.searchQuery || ''; // Lấy giá trị tìm kiếm từ query

    try {
        // Sử dụng $regex để tìm kiếm tiêu đề có chứa chuỗi trong searchQuery, không phân biệt hoa-thường
        const courses = await Course.find({ title: { $regex: searchQuery, $options: 'i' } })
            .populate('lessons', 'title _id')
            .populate('author', 'name _id own_courses profilePic')
            .skip((page - 1) * perPage)
            .limit(perPage);

        const count = await Course.countDocuments({ title: { $regex: searchQuery, $options: 'i' } });

        res.render('courses/search', {
            topic: searchQuery,
            courses,
            currentPage: page,
            totalPages: Math.ceil(count / perPage),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
    
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

module.exports.viewACourse = async (req, res) => {
    // Fetch the course details along with lessons and author information
    const viewedCourse = await Course.findById(req.params.id)
        .populate('lessons', 'title _id')
        .populate('author', 'name _id own_courses profilePic');
    
    // Get the total number of courses by the author
    const authorNumberOfCourse = await Course.countDocuments({ author: viewedCourse.author });

    // Pagination setup
    const perPage = 10; // Number of ratings per page
    const page = Math.max(1, parseInt(req.query.page) || 1); // Ensure the page is at least 1

    // Fetch total number of ratings for the course
    const totalRatings = await Rating.countDocuments({ courseRated: viewedCourse._id });
    const totalPages = Math.ceil(totalRatings / perPage);

    // Fetch the ratings for the current page
    const ratings = await Rating.find({ courseRated: viewedCourse._id })
        .populate('author', 'name _id profilePic')
        .skip((perPage * (page - 1)))
        .limit(perPage);

    // Check if the user has already rated the course
    let didUserRate = false;
    ratings.forEach((rating) => {
        if (rating.author.equals(req.user._id)) didUserRate = true;
    });
    
    // Calculate the average rating
    const ratingStats = await Rating.aggregate([
        { $match: { courseRated: viewedCourse._id } }, // Filter ratings for the specific course
        { $group: { 
            _id: null,
            sumOfRatings: { $sum: "$rating" },  // Sum of all ratings
            totalRatings: { $sum: 1 }  // Total count of ratings
        }}
    ]);

    // If ratings exist, calculate the average
    let averageRating = 0;
    if (ratingStats.length > 0) {
        const sumOfRatings = ratingStats[0].sumOfRatings;
        const totalRatingsCount = ratingStats[0].totalRatings;
        averageRating = sumOfRatings / totalRatingsCount;
    }

    // Round the average to one decimal place (optional)
    averageRating = Math.round(averageRating * 10) / 10;

    // Render the course page with the average rating and other data
    res.render('courses/showCourse', {
        topic,
        viewedCourse,
        authorNumberOfCourse,
        ratings,
        didUserRate,
        currentPage: page,
        totalPages,
        averageRating  // Pass averageRating to the view
    });
};


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
    const deltedRating = await Rating.deleteMany({courseRated: id});
    res.redirect('/courses');
}
