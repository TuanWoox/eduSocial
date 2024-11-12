const express = require('express');
const multer = require('multer');
const CatchAsync = require('../utils/CatchAsync');
const router = express.Router({mergeParams: true});
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});
const postController = require('../controllers/post');
const postCommentController = require('../controllers/postComment');
const {isLoggedIn,isAuthorOfPost,isAuthorOfPostComment} = require('../middleware/checkMiddleware');
const {validatePost} = require('../middleware/validateMiddleware')
  
router.get('/', CatchAsync(postController.viewPost));

router.route('/create')
.get(isLoggedIn,postController.viewCreate)
.post(isLoggedIn,validatePost,CatchAsync(postController.createPost));

router.route('/:id/sendAnswers')
.post(isLoggedIn,CatchAsync(postCommentController.sendAnswer))

router.route('/:id/editAnswer/:commentID')
.get(isLoggedIn,isAuthorOfPostComment,CatchAsync(postCommentController.formEditAnswer))

router.route('/:id/:commentID') 
.put(isLoggedIn,isAuthorOfPostComment,CatchAsync(postCommentController.editAnswer))
.delete(isLoggedIn,isAuthorOfPostComment,CatchAsync(postCommentController.deleteAnswer))

// Route để view form edit bài viết
router.route('/:id/edit')
.get(isLoggedIn,isAuthorOfPost,CatchAsync(postController.viewEdit));

// Route để lấy bài viết cụ thể và cập nhật
router.route('/:id')
.get(CatchAsync(postController.viewAPost))
.delete(isLoggedIn,isAuthorOfPost,CatchAsync(postController.deletePost))
.put(isLoggedIn,isAuthorOfPost,validatePost,CatchAsync(postController.editPost));

// router.get('/:id/like',CatchAsync(postController.addLike))


module.exports = router;