const Post = require('../models/Post'); 
const path = require('path');
const fs = require('fs');
const { cloudinary } = require('../cloudinary/postCloud');
const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}

//This is for post index
module.exports.viewPost = async (req, res) => {
    try {
        const post = await Post.find() // Đợi kết quả truy vấn với `await`
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
    const {title,content,type,images} = req.body.post;
    const imagesParsed = JSON.parse(images);
    const newPost = new Post({
        title,
        content,
        type,
        images: imagesParsed,
    });
   
    await newPost.save();
    res.redirect(`/posts/${newPost._id}`);
}

//This is for viewing a particular post
module.exports.viewAPost = async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id).populate('comments');
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
    const newData = {
        title: req.body.post.title,
        type: req.body.post.type,
        content: req.body.post.content,
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
// module.exports.addLike = async (req,res) => {
//     const id = req.params.id;
//     const post = await Post.findById(id);
//     post.like += 1;
//     await post.save();
//     res.redirect('/user/post');
// }
