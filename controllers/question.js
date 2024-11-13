const Question = require('../models/question');
const Comment = require('../models/comment');
const topic = {
    title: 'Hỏi đáp',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'câu hỏi'
}
module.exports.index = async (req, res) => {
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
    const questions = await Question.find().populate({
        path: 'author',
        select: 'name _id profilePic'
    })
    .sort(sortBy)  // Apply the sorting
    .skip((page - 1) * questionsPerPage)  // Skip questions for previous pages
    .limit(questionsPerPage);  // Limit to the number of questions per page

    // Get the total count of questions for pagination
    const totalQuestion = await Question.countDocuments();
    const totalPages = Math.ceil(totalQuestion / questionsPerPage);

    // Render the page with the necessary data
    res.render('questions/index', {
        topic,
        questions,
        currentPage: page,
        totalPages,
        sort  // Pass the current sort option to the template
    });
};



module.exports.creationForm = (req,res) => {
    res.render('questions/create', {topic});
}

module.exports.createQuestion = async (req, res) => {
    // Split tags by spaces and store them in an array
    const tagsArray = req.body.question.tags.split(' ').filter(tag => tag.trim() !== '');
    const newQuestion = new Question({
        ...req.body.question,
        tags: tagsArray, // Assign the tags array to the tags field,
        author: req.user._id
    });
    await newQuestion.save();
    req.flash('success', 'Tạo câu hỏi thành công!!!');
    res.redirect(`/questions/${newQuestion._id}`);
};
module.exports.viewEditQuestion = async (req,res) => {
    const question = await Question.findById(req.params.id)
    res.render('questions/edit', {topic,question});
}

module.exports.viewQuestion = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const commentsPerPage = 10;
   

    const question = await Question.findById(req.params.id)
    .populate({
        path: 'author',
        select: 'name _id',
    });
    const query = {
        commentedOnQuestion: question._id
    }

    const comments = await Comment.find(query)
    .limit(commentsPerPage)
    .skip((page - 1) * commentsPerPage)
    .populate({
        path: 'author',
        select: 'name _id profilePic',
    })
    .populate({
        path: 'replyTo',
        populate: {
            path: 'author',
            select: 'name _id',
        },
        select: '_id body',
    });

    const totalComments = await Comment.countDocuments(query);
    const totalPages = Math.ceil(totalComments / commentsPerPage);
    question.views += 1;
    await question.save();
    res.render('questions/show', {
        topic,
        question,
        comments,
        currentPage: page,
        totalPages,
        totalComments
    });
};
module.exports.editQuestion = async (req, res) => {
        const { id } = req.params; 
        const updatedData = req.body.question; 
        if (updatedData.tags) {
            updatedData.tags = updatedData.tags.split(' ').filter(tag => tag.trim() !== '');
        }
        const question = await Question.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!question) {
            return res.status(404).send('Question not found');
        }
        req.flash('success', 'Chỉnh sửa câu hỏi thành công!!!');
        res.redirect(`/questions/${id}`);
};

module.exports.deleteQuestion = async (req,res) => {
    await Question.findByIdAndDelete(req.params.id)
    req.flash('success', 'Xóa câu hỏi thành công!!!');
    res.redirect('/questions');
}
