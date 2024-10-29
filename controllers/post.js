const Post = require('../models/Post');
const path = require('path');
const fs = require('fs');
const topic = {
    title: 'Bài viết',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}
module.exports.viewPost = async (req, res) => {
    try {
        const post = await Post.find(); // Đợi kết quả truy vấn với `await`
        res.render('posts/show', { post }); // Render view với dữ liệu
    } catch (err) {
        console.error(err); // Log lỗi nếu xảy ra
        res.status(500).send('Lỗi trong việc lấy bài viết từ cơ sở dữ liệu'); // Gửi phản hồi lỗi nếu có sự cố
    }
};
module.exports.create = async(req,res) =>{
    const {title,content,type} = req.body.post;
    const mediaPath = req.file ? `/uploads/${req.file.filename}` : null;
    const post = new Post({
        title,
        content,
        type,
        media: mediaPath});
    await post.save();
    res.redirect('/user/post');
}

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
    const updateData = req.body.post; 
    if(req.file){
        const mediaPath =  `/uploads/${req.file.filename}`;
        updateData.media = mediaPath;
    }
    const post = await Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!post) {
        return res.status(404).send('Post not found');
    }
    res.redirect(`/user/post/${id}`);
};

// Hiển thị bài viết cụ thể và cập nhật lượt xem
module.exports.viewAPost = async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);
    if (!post) {
        return res.status(404).send('Post not found');
    }
    post.views += 1; // Tăng lượt xem mỗi khi người dùng truy cập
    await post.save();
    res.redirect('/user/post');
};

module.exports.deletePost = async (req,res) =>{
    const _id = req.params.id;
    const post = await Post.findByIdAndDelete(_id);
    if (post.media) {
        fs.unlinkSync(path.join(__dirname, '..', post.media));
    }
    res.redirect('/user/post');
}
module.exports.addLike = async (req,res) => {
    const id = req.params.id;
    const post = await Post.findById(id);
    post.like += 1;
    await post.save();
    res.redirect('/user/post');
}
module.exports.detailPost = async (req,res) => {
    const post = await Post.findById(req.params.id);
    post.views += 1;
    await post.save();
    res.render('posts/postDetail', { post });
}