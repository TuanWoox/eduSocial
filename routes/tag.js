const express = require('express');
const router = express.Router({mergeParams: true});
const tagController = require('../controllers/tag');
router.get('/suggest', tagController.suggestTagByLetter);

router.get('/questionsTagged/:id',tagController.indexQuestionsTagsById)

router.get('/postsTagged/:id',tagController.indexPostsTagsById)

router.get('/popularTags', tagController.findPopularTags)

router.get('/search', tagController.searchTag)

router.get('/', tagController.indexAll)

module.exports = router;