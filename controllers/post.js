const Post = require('../models/Post');
const path = require('path');
const fs = require('fs');
const { model } = require('mongoose');
const { cloundinary, cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}

//This is for post index
module.exports.viewPost = async (req, res) => {
    try {
        const post = await Post.find(); // Đợi kết quả truy vấn với `await`
        res.render('posts/index', { post, topic }); // Render view với dữ liệu
    } catch (err) {
        console.error(err); // Log lỗi nếu xảy ra
        res.status(500).send('Lỗi trong việc lấy bài viết từ cơ sở dữ liệu'); // Gửi phản hồi lỗi nếu có sự cố
    }
};

//This is for viewing the form the create the post
module.exports.viewCreate = (req,res) => {
    res.render('posts/create', {topic});
}

//This is for posting a post
module.exports.createPost = async(req,res) =>{
    const {title,content,type} = req.body.post;
    const newPost = new Post({
        title,
        content,
        type});
    newPost.images = req.files.map(f=> ({url: f.path, filename: f.filename}));
    await newPost.save();
    res.redirect(`/posts/${newPost._id}`);
}

//This is for viewing a particular post
module.exports.viewAPost = async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
        return res.status(404).send('Post not found');
    }
    post.views += 1; // Tăng lượt xem mỗi khi người dùng truy cập
    await post.save();
    res.render('posts/show', {post, topic});
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
    const post = await Post.findByIdAndUpdate(req.params.id, req.body.post, { new: true, runValidators: true });
    console.log(req.files);
    const imgs = req.files.map(f => ({url:f.path, filename: f.filename}));
    post.images.push(...imgs);
    await post.save();
    if(req.body.deleteImages)
        {
            for(let filename of req.body.deleteImages )
            {
                await cloudinary.uploader.destroy(filename);
            }
            await Post.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
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
    res.redirect('/posts');
}




// module.exports.addLike = async (req,res) => {
//     const id = req.params.id;
//     const post = await Post.findById(id);
//     post.like += 1;
//     await post.save();
//     res.redirect('/user/post');
// }
