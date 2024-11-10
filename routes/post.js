const express = require('express');
const multer = require('multer');
const middleware = require('../middleware/authMiddleware');
const CatchAsync = require('../utils/CatchAsync');
const router = express.Router({mergeParams: true});
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const postController = require('../controllers/post');
const postCommentController = require('../controllers/postComment');
  
router.get('/', CatchAsync(postController.viewPost));

router.route('/create')
.get(postController.viewCreate)
.post(CatchAsync(postController.createPost));

router.route('/:id/sendAnswers')
.post(CatchAsync(postCommentController.sendAnswer))

router.route('/:id/editAnswer/:commentID')
.get(CatchAsync(postCommentController.formEditAnswer))

router.route('/:id/:commentID') 
.put(CatchAsync(postCommentController.editAnswer))
.delete(CatchAsync(postCommentController.deleteAnswer))

// Route để view form edit bài viết
router.route('/:id/edit')
.get(CatchAsync(postController.viewEdit));

// Route để lấy bài viết cụ thể và cập nhật
router.route('/:id')
.get(CatchAsync(postController.viewAPost))
.delete(CatchAsync(postController.deletePost))
.put(CatchAsync(postController.editPost));

// router.get('/:id/like',CatchAsync(postController.addLike))


module.exports = router;