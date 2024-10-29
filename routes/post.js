const express = require('express');
const multer = require('multer');
const middleware = require('../middleware/authMiddleware');
const postController = require('../controllers/post');
const CatchAsync = require('../utils/CatchAsync');
const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
const upload = multer({ 
    storage,
    limits: { fileSize: 1000 * 1024 * 1024 }, //100MB
    fileFilter: (req, file, cb) =>{
        const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg", "video/mp4", "video/mkv", "video/x-matroska"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const err = new Error('Only .png, .jpg, .jpeg, .mp4, and .mkv formats are allowed!');
            err.name = 'ExtensionError';
            cb(err, false);
        }
    }
});

// Route chỉ dành cho người dùng đã đăng nhập
router.get('/',middleware.auth, CatchAsync(postController.viewPost));
router.route('/create')
.get(middleware.auth,(req,res)=>{
    res.render('posts/create');
})
.post(middleware.auth,upload.single('media'), CatchAsync(postController.create));

router.route('/:id/delete')
.get(CatchAsync(postController.viewDelete));

// Route để view form edit bài viết
router.route('/:id/edit')
    .get(CatchAsync(postController.viewEdit));

// Route để lấy bài viết cụ thể và cập nhật
router.route('/:id')
    .get(CatchAsync(postController.viewAPost))
    .delete(CatchAsync(postController.deletePost))
    .put(upload.single('media'),CatchAsync(postController.editPost));

router.get('/:id/like',CatchAsync(postController.addLike))

router.get('/:id/detail',CatchAsync(postController.detailPost));

module.exports = router;