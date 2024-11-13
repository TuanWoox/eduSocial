const Post = require('../models/Post'); 
const Comment = require('../models/comment');
const { cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
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
    const post = await Post.find().populate({
        path: 'author',
        select: 'name _id profilePic'
    })
    .sort(sortBy)  // Apply the sorting
    .skip((page - 1) * postsPerPage)  // Skip post for previous pages
    .limit(postsPerPage);  // Limit to the number of post per page

    // Get the total count of posts for pagination
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / postsPerPage);

    // Render the page with the necessary data
    res.render('posts/index', {
        topic,
        post,
        currentPage: page,
        totalPages,
        sort  // Pass the current sort option to the template
    });
};

//This is for viewing the form the create the post
module.exports.viewCreate = (req,res) => {
    res.render('posts/create', {topic});
}

//This is for posting a post
module.exports.createPost = async(req,res) =>{
    const {title,content,type,images} = req.body.post;
    const tagsArray = req.body.post.tags.split(' ').filter(tag => tag.trim() !== '');
    const imagesParsed = JSON.parse(images);
    const newPost = new Post({
        title,
        content,
        type,
        images: imagesParsed,
        author: req.user._id,
        tags: tagsArray
    });
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

    res.render('posts/show', {
        topic,
        post, 
        comments,
        currentPage: page,
        totalPages,
        totalComments
    });
};

// Hiển thị form chỉnh sửa bài viết
module.exports.viewEdit = async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
        return res.status(404).send('Post not found');
    }
    res.render('posts/edit', {topic,post});
};

// Xử lý chỉnh sửa bài viết
module.exports.editPost = async (req, res) => {
    const id = req.params.id;
    const tagsArray = req.body.post.tags.split(' ').filter(tag => tag.trim() !== '');
    const newData = {
        title: req.body.post.title,
        type: req.body.post.type,
        content: req.body.post.content,
        tags: tagsArray
    }
    const post = await Post.findByIdAndUpdate(req.params.id, newData, { new: true, runValidators: true });
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
    console.log(filename);
    await cloudinary.uploader.destroy(filename);
}
