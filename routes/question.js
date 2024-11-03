const express = require('express');
const router = express.Router({mergeParams : true});
const CatchAsync = require('../utils/CatchAsync');
const questionControl = require('../controllers/question');
const questionComment = require('../controllers/questionComments');
router.route('/')
.get(CatchAsync(questionControl.index))
.post(CatchAsync(questionControl.createQuestion))

router.route('/create')
.get(questionControl.creationForm)


router.route('/:id/edit')
.get(CatchAsync(questionControl.viewEditQuestion));

router.route('/:id/sendAnswers')
.post(CatchAsync(questionComment.sendAnswer));

router.route('/:id/editAnswers/:commentID')
.get(questionComment.formEditAnswer)

router.route('/:id/:commentID') 
.put(CatchAsync(questionComment.editAnswer))
.delete(CatchAsync(questionComment.deleteAnswer))


router.route('/:id')
.get(questionControl.viewQuestion)
.delete(CatchAsync(questionControl.deleteQuestion))
.put(CatchAsync(questionControl.editQuestion));





module.exports = router