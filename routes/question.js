const express = require('express');
const router = express.Router({mergeParams : true});
const CatchAsync = require('../utils/CatchAsync');
const questionControl = require('../controllers/question');
const questionComment = require('../controllers/questionComments');
const {isLoggedIn,isAuthorOfQuestion,isAuthorOfQuestionComment} = require('../middleware/checkMiddleware');
const {validateQuestion,validateQuestionComment} = require('../middleware/validateMiddleware');
router.route('/')
.get(CatchAsync(questionControl.index))

router.route('/create')
.get(isLoggedIn,questionControl.creationForm)
.post(isLoggedIn,validateQuestion,CatchAsync(questionControl.createQuestion))



router.route('/:id/edit')
.get(isLoggedIn,isAuthorOfQuestion,CatchAsync(questionControl.viewEditQuestion));

router.route('/:id/sendAnswers')
.post(isLoggedIn,validateQuestionComment,CatchAsync(questionComment.sendAnswer));

router.route('/:id/editAnswers/:commentID')
.get(isLoggedIn,isAuthorOfQuestionComment,questionComment.formEditAnswer)

router.route('/:id/:commentID') 
.put(isLoggedIn,isAuthorOfQuestionComment,validateQuestionComment,CatchAsync(questionComment.editAnswer))
.delete(isLoggedIn,isAuthorOfQuestionComment,CatchAsync(questionComment.deleteAnswer))


router.route('/:id')
.get(questionControl.viewQuestion)
.delete(isLoggedIn,isAuthorOfQuestion,CatchAsync(questionControl.deleteQuestion))
.put(isLoggedIn,isAuthorOfQuestion,validateQuestion,CatchAsync(questionControl.editQuestion));





module.exports = router