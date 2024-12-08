const Post = require('../models/Post'); 
const Comment = require('../models/comment');
const Tag = require('../models/tag');
const Notification = require('../models/notification');
const { cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết',
    linkCreate: '/posts/create'
}

//This is for post index
module.exports.viewPost = async (req, res) => {

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
    const posts = await Post.find()
    .populate({
        path: 'author',
        select: 'name _id profilePic'
    })
    .populate({
        path: 'tags', // Populate the 'tags' field
        select: 'name _id', // Choose the fields you want from the tag model
    })
    .sort(sortBy)  // Apply the sorting
    .skip((page - 1) * postsPerPage)  // Skip post for previous pages
    .limit(postsPerPage);  // Limit to the number of post per page

    // Get the total count of posts for pagination
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    //fetch the tag
    const response = await fetch('http://localhost:5000/tags/popularTags');
    const popularTags = await response.json();  // Corrected the method to .json()

    // Fetch and add totalComments for each question
    for (const post of posts) {
        const totalComments = await Comment.countDocuments({ commentedOnPost: post._id });
        post.totalComments = totalComments;  // Adding totalComments field
        console.log(post);
    }

    // Render the page with the necessary data
    res.render('posts/index', {
        topic,
        posts,
        currentPage: page,
        totalPages,
        popularTags,
        sort  // Pass the current sort option to the template
    });
};

//thêm(tìm kiếm bai viet)
module.exports.Search = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 15;

    let sortBy = { createdAt: -1 };  // Mặc định sắp xếp theo bài mới nhất
    let sort = 'newest';  // Tuỳ chọn mặc định
    const searchQuery = req.query.searchQuery || ''; // Lấy giá trị tìm kiếm từ query

    if (req.query.sort === 'views') {
        sortBy = { views: -1 };
        sort = 'views';
    }
    if (req.query.sort === 'activity') {
        sortBy = { updatedAt: -1 };
        sort = 'activity';
    }

    try {
        // Tìm kiếm bài viết theo title chứa searchQuery (không phân biệt chữ hoa/thường)
        const posts = await Post.find({ title: { $regex: searchQuery, $options: 'i' } })
            .populate({
                path: 'author',
                select: 'name _id profilePic'
            })
            .sort(sortBy)
            .skip((page - 1) * postsPerPage)
            .limit(postsPerPage);

        const count = await Post.countDocuments({ title: { $regex: searchQuery, $options: 'i' } });
        const totalPages = Math.ceil(count / postsPerPage);
        // Fetch and add totalComments for each question
        for (const post of posts) {
            const totalComments = await Comment.countDocuments({ commentedOnPost: post._id });
            post.totalComments = totalComments;  // Adding totalComments field
            console.log(post);
        }
        res.render('posts/search', {
            topic,
            posts,  // Đổi thành posts để phù hợp với template
            searchQuery,  // Đưa searchQuery vào để hiển thị lại trong input
            currentPage: page,
            totalPages,
            sort
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};


//This is for viewing the form the create the post
module.exports.viewCreate = (req,res) => {
    res.render('posts/create', {topic});
}

//This is for posting a post
module.exports.createPost = async(req,res) =>{
    
    const {title,content,type,images} = req.body.post;
    

    const imagesParsed = JSON.parse(images);
    const newPost = new Post({
        title,
        content,
        type,
        images: imagesParsed,
        author: req.user._id,
        tags: []
    });

    // Parse tags and extract the value field
    const tagsArray = JSON.parse(req.body.post.tags)
        .map(tag => tag.value) // Extract the 'value' field
        .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags

     // Create an array of promises to handle asynchronous tag updates
     const tagPromises = tagsArray.map(async (element) => {
        let tag = await Tag.findOne({ name: element });
        if (tag) { // Check if the tag exists
            tag.postsTagged.push(newPost.id); // Add the question ID to the new tag's questionsTagged
            newPost.tags.push(tag.id); // Add the new tag's ID to the newQuestion tags array
            await tag.save(); // Save the tag with the updated questionsTagged
        } else {
            // Create and save a new tag if it doesn't exist
            const newTag = new Tag({ name: element });
            newTag.postsTagged.push(newPost.id); // Add the question ID to the new tag's questionsTagged
            newPost.tags.push(newTag.id); // Add the new tag's ID to the newQuestion tags array
            await newTag.save(); // Save the newly created tag
        }
    });

    // Wait for all tag operations to finish
    await Promise.all(tagPromises);

    await newPost.save();
    req.flash('success', 'Tạo bài mới thành công!!!');
    res.redirect(`/posts/${newPost._id}`);
}

//This is for viewing a particular post
module.exports.viewAPost = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const commentsPerPage = 10;
    const post = await Post.findById(req.params.id)
    .populate({
        path: 'author',
        select: 'name _id',
    })
    .populate({
        path: 'tags', // Populate the 'tags' field
        select: 'name _id', // Choose the fields you want from the tag model
    });
    const query = {
        commentedOnPost: post._id
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
    const totalPages = Math.ceil(totalComments/commentsPerPage);

    post.views += 1; 
    await post.save();
    let isLikedByUser = false;
    if(req.user)
    {
        const isLikedByUser = question.isLiked.includes(req.user._id);
    }
    res.render('posts/show', {
        topic,
        post, 
        comments,
        currentPage: page,
        totalPages,
        totalComments,
        isLikedByUser
    });
};

// Hiển thị form chỉnh sửa bài viết
module.exports.viewEdit = async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id).populate({
        path: 'tags', // Populate the 'tags' field
        select: 'name _id', // Choose the fields you want from the tag model
    });
    if (!post) {
        return res.status(404).send('Post not found');
    }
    res.render('posts/edit', {topic,post});
};

// Xử lý chỉnh sửa bài viết
module.exports.editPost = async (req, res) => {
    const id = req.params.id;
    

    const post = await Post.findById(id)
    .populate({
            path: 'tags', // Populate the 'tags' field
            select: 'name _id', // Choose the fields you want from the tag model
    });
    const tagsArray = JSON.parse(req.body.post.tags)
        .map(tag => tag.value) // Extract the 'value' field
        .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags

    const existingTagNames = post.tags.map(tag => tag.name);
    const tagsToRemove = existingTagNames.filter(tagName => !tagsArray.includes(tagName));

    for (let tagName of tagsToRemove) {
        const tag = await Tag.findOne({ name: tagName });
        if (tag) {
            // Remove the question's _id from the tag's questionsTagged array
            tag.postsTagged = tag.postsTagged.filter(postId => !postId.equals(id));
            await tag.save();

            post.tags = post.tags.filter(tag => tag.name !== tagName);
        }
    }
    for (let newTagName of tagsArray) {
        const existingTag = post.tags.find(tag => tag.name === newTagName);
        if (!existingTag) {
            // If tag doesn't exist in the current question's tags, find or create the tag
            let tag = await Tag.findOne({ name: newTagName });
            if (!tag) {
                tag = new Tag({ name: newTagName });
                await tag.save(); // Save the new tag if it doesn't exist
            }
            // Add the question's _id to the questionsTagged array of the tag
            tag.postsTagged.push(post._id);
            await tag.save(); // Save the updated tag
            // Add the tag to the question's tags
            post.tags.push(tag._id);            }
    }

    post.title = req.body.post.title;
    post.type = req.body.post.type;
    post.content = req.body.post.content;
    await post.save();

    const imgs = JSON.parse(req.body.newImages);
    post.images.push(...imgs);
    await post.save();
    const deletedImages = JSON.parse(req.body.deletedImages);
    if(deletedImages)
        {
            for(let filename of deletedImages )
            {
                await cloudinary.uploader.destroy(filename);
            }
            await Post.updateOne({$pull: {images: {filename: {$in: deletedImages}}}});
    }
    res.redirect(`/posts/${id}`);
};

module.exports.deletePost = async (req,res) =>{
    const id = req.params.id;
    const post = await Post.findByIdAndDelete(id);
    for(const image of post.images)
    {
        await cloudinary.uploader.destroy(image.filename);
    }
    await Tag.updateMany(
        { postsTagged: post._id },  // Find tags that have the post._id in their postsTagged array
        { $pull: { postsTagged: post._id } }  // Pull (remove) post._id from the postsTagged array
    );
    const deletedNotification = await Notification.deleteMany({post: post._id});
    req.flash('success', 'Đã xóa bài của bạn thành công!!!');
    res.redirect('/posts');
}

module.exports.uploadTinyMCE = async (req, res) => {
    if(req.file)
    {   
        res.json({url: req.file.path, filename: req.file.filename});
    } else {
        res.status(400).json({error: 'Image upload failed'})
    }
}

module.exports.deleteTinyMCE = async (req,res) => {
    const filename = decodeURIComponent(req.params.filename)
    await cloudinary.uploader.destroy(filename);
}
module.exports.likePost = async (req, res) => {
    try {
        const id = req.params.id; // Lấy id từ URL params
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Câu hỏi không tồn tại.' });
        }
        
        post.isLiked.push(req.user._id);
        await post.save();
        res.status(200).json({ status: "ok" });

        const posts = await Post.findById(id).populate('author'); // Sửa id thành req.params.id
        if (posts && posts.author && posts.author._id.toString() !== req.user._id.toString()) {
            const notification = new Notification({
                recipient: posts.author._id,
                sender: req.user._id,
                post: posts._id, // Sử dụng questions._id chứ không phải id
                message: `${req.user.name} đã thích BÀI VIẾT của bạn.`,
                isRead: false
            });
            await notification.save();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thích bài viết.' });
    }
};

module.exports.unlikePost = async (req,res) => {
    const post = await Post.findById(req.params.id);
    post.isLiked.pull(req.user._id);
    await post.save();
    res.status(200).json({ status: "ok" });
}