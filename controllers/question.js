const Question = require('../models/question');
const Comment = require('../models/comment');
const User = require('../models/User');
const Tag = require('../models/tag');
const { json } = require('express');
const question = require('../models/question');
const Notification = require('../models/notification');
const topic = {
    title: 'Hỏi đáp',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'câu hỏi',
    linkCreate: '/questions/create'
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
    const questions = await Question.find()
    .populate({
        path: 'author',
        select: 'name _id profilePic'
    })
    .populate({
        path: 'tags', // Populate the 'tags' field
        select: 'name _id', // Choose the fields you want from the tag model
    })
    .sort(sortBy)  // Apply the sorting
    .skip((page - 1) * questionsPerPage)  // Skip questions for previous pages
    .limit(questionsPerPage);  // Limit to the number of questions per page

    // Get the total count of questions for pagination
    const totalQuestion = await Question.countDocuments();
    const totalPages = Math.ceil(totalQuestion / questionsPerPage);
    

    //fetch the tag
    const response = await fetch('http://localhost:5000/tags/popularTags');
    const popularTags = await response.json();  // Corrected the method to .json()
 

    // Fetch and add totalComments for each question
    for (const question of questions) {
        const totalComments = await Comment.countDocuments({ commentedOnQuestion: question._id });
        question.totalComments = totalComments;  // Adding totalComments field
    }


    res.render('questions/index', {
        topic,
        questions,
        currentPage: page,
        totalPages,
        popularTags,
        sort  // Pass the current sort option to the template
    });
};

//thêm(tìm kiếm khóa học)
module.exports.Search = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const questionsPerPage = 15;
    const searchQuery = req.query.searchQuery || ''; // Lấy từ khóa tìm kiếm từ query string

    // Default sorting by newest
    let sortBy = { createdAt: -1 }; // Sorting by newest by default
    let sort = 'newest'; // Default sort option

    // Check if sorting by views is requested
    if (req.query.sort === 'views') {
        sortBy = { views: -1 }; // Sort by views in descending order
        sort = 'views';
    }

    try {
        // Tìm kiếm bài viết theo title chứa searchQuery (không phân biệt chữ hoa/thường)
        const questions = await Question.find({ 
            title: { $regex: searchQuery, $options: 'i' } 
        })
        .populate({
            path: 'author',
            select: 'name _id profilePic'
        })
        .sort(sortBy)  // Apply the sorting
        .skip((page - 1) * questionsPerPage)  // Skip questions for previous pages
        .limit(questionsPerPage);  // Limit to the number of questions per page

        const count = await Question.countDocuments({ 
            title: { $regex: searchQuery, $options: 'i' } 
        });

        const totalPages = Math.ceil(count / questionsPerPage); // Total pages for the search result
        // Fetch and add totalComments for each question
        for (const question of questions) {
            const totalComments = await Comment.countDocuments({ commentedOnQuestion: question._id });
            question.totalComments = totalComments;  // Adding totalComments field
        }
        res.render('questions/search', {
            topic,
            questions,
            currentPage: page,
            totalPages,
            sort, // Pass the current sort option to the template
            searchQuery // Pass searchQuery to render back to input box
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};


module.exports.creationForm = (req,res) => {
    res.render('questions/create', {topic});
}

module.exports.createQuestion = async (req, res) => {
    // Parse tags and extract the value field
    const tagsArray = JSON.parse(req.body.question.tags)
        .map(tag => tag.value) // Extract the 'value' field
        .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags

    const newQuestion = new Question({
        ...req.body.question,
        author: req.user._id,
        tags: [],
    });

    // Create an array of promises to handle asynchronous tag updates
    const tagPromises = tagsArray.map(async (element) => {
        let tag = await Tag.findOne({ name: element });
        if (tag) { // Check if the tag exists
            tag.questionsTagged.push(newQuestion.id); // Add the question ID to the questionsTagged array
            newQuestion.tags.push(tag.id); // Add the tag's ID to the newQuestion tags array
            await tag.save(); // Save the tag with the updated questionsTagged
        } else {
            // Create and save a new tag if it doesn't exist
            const newTag = new Tag({ name: element });
            newTag.questionsTagged.push(newQuestion.id); // Add the question ID to the new tag's questionsTagged
            newQuestion.tags.push(newTag.id); // Add the new tag's ID to the newQuestion tags array
            await newTag.save(); // Save the newly created tag
        }
    });

    // Wait for all tag operations to finish
    await Promise.all(tagPromises);

    // Save the new question after all tags are updated
    await newQuestion.save();

    // Provide feedback to the user
    req.flash('success', 'Tạo câu hỏi thành công!!!');
    res.redirect(`/questions/${newQuestion._id}`);
};



module.exports.viewEditQuestion = async (req,res) => {
    const question = await Question.findById(req.params.id)
    .populate({
        path: 'tags', // Populate the 'tags' field
        select: 'name _id', // Choose the fields you want from the tag model
    });
    res.render('questions/edit', {topic,question});
}

module.exports.viewQuestion = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const commentsPerPage = 10;
   

    const question = await Question.findById(req.params.id)
    .populate({
        path: 'author',
        select: 'name _id',
    })
    .populate({
        path: 'tags', // Populate the 'tags' field
        select: 'name _id', // Choose the fields you want from the tag model
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
    const isLikedByUser = question.isLiked.includes(req.user._id);
    res.render('questions/show', {
        topic,
        question,
        comments,
        currentPage: page,
        totalPages,
        totalComments,
        isLikedByUser
    });
};
module.exports.editQuestion = async (req, res) => {
        const { id } = req.params; 
        const tagsArray = JSON.parse(req.body.question.tags)
        .map(tag => tag.value) // Extract the 'value' field
        .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags
        const question = await Question.findById(id)
        .populate({
            path: 'tags', // Populate the 'tags' field
            select: 'name _id', // Choose the fields you want from the tag model
        });
        const existingTagNames = question.tags.map(tag => tag.name);
        const tagsToRemove = existingTagNames.filter(tagName => !tagsArray.includes(tagName));

        for (let tagName of tagsToRemove) {
            const tag = await Tag.findOne({ name: tagName });
            if (tag) {
                // Remove the question's _id from the tag's questionsTagged array
                tag.questionsTagged = tag.questionsTagged.filter(questionId => !questionId.equals(id));
                await tag.save();

                question.tags = question.tags.filter(tag => tag.name !== tagName);
            }
        }

        for (let newTagName of tagsArray) {
            const existingTag = question.tags.find(tag => tag.name === newTagName);
            if (!existingTag) {
                // If tag doesn't exist in the current question's tags, find or create the tag
                let tag = await Tag.findOne({ name: newTagName });
                if (!tag) {
                    tag = new Tag({ name: newTagName });
                    await tag.save(); // Save the new tag if it doesn't exist
                }
                // Add the question's _id to the questionsTagged array of the tag
                tag.questionsTagged.push(question._id);
                await tag.save(); // Save the updated tag
                // Add the tag to the question's tags
                question.tags.push(tag._id);            }
        }

        question.title = req.body.question.title;
        question.body = req.body.question.body;

        await question.save();
    
      
        req.flash('success', 'Chỉnh sửa câu hỏi thành công!!!');
        res.redirect(`/questions/${id}`);
};

module.exports.deleteQuestion = async (req,res) => {
    await Question.findByIdAndDelete(req.params.id)
    req.flash('success', 'Xóa câu hỏi thành công!!!');
    res.redirect('/questions');
}
module.exports.likeQuestion = async (req, res) => {
    try {
        const id = req.params.id; // Lấy id từ URL params
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Câu hỏi không tồn tại.' });
        }
        
        question.isLiked.push(req.user._id);
        await question.save();
        res.status(200).json({ status: "ok" });

        const questions = await Question.findById(id).populate('author'); // Sửa id thành req.params.id
        if (questions && questions.author && questions.author._id.toString() !== req.user._id.toString()) {
            const notification = new Notification({
                recipient: questions.author._id,
                sender: req.user._id,
                question: questions._id, // Sử dụng questions._id chứ không phải id
                message: `${req.user.name} đã thích CÂU HỎI của bạn.`,
                isRead: false
            });
            await notification.save();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thích câu hỏi.' });
    }
};

module.exports.unLikeQuestion = async (req,res) => {
    const question = await Question.findById(req.params.id);
    question.isLiked.pull(req.user._id);
    await question.save();
    res.status(200).json({ status: "ok" });
}