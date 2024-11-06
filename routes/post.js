const express = require('express');
const multer = require('multer');
const middleware = require('../middleware/authMiddleware');
const postController = require('../controllers/post');
const CatchAsync = require('../utils/CatchAsync');
const router = express.Router({mergeParams: true});
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
  
router.get('/', CatchAsync(postController.viewPost));

router.route('/create')
.get(postController.viewCreate)
.post(CatchAsync(postController.createPost));

// Route để view form edit bài viết
router.route('/:id/edit')
    .get(CatchAsync(postController.viewEdit));

// Route để lấy bài viết cụ thể và cập nhật
router.route('/:id')
    .get(CatchAsync(postController.viewAPost))
    .delete(CatchAsync(postController.deletePost))
    .put(upload.array('images',5),CatchAsync(postController.editPost));

// router.get('/:id/like',CatchAsync(postController.addLike))


module.exports = router;