const express = require('express');
const router = express.Router();
const CatchAsync = require('../utils/CatchAsync');
const questionControl = require('../controllers/question');
router.route('/')
.get(CatchAsync(questionControl.index))


module.exports = router