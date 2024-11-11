const express = require('express');
const multer = require('multer');
const imageHandlerController = require('../controllers/imageHandler');
const CatchAsync = require('../utils/CatchAsync');
const router = express.Router({mergeParams: true});
const { storage } = require('../cloudinary/postCloud');
const upload = multer({storage});


router.route('/upload')
.post(upload.single('image'), CatchAsync(imageHandlerController.uploadTinyMCE));

// New route to handle multiple deletions
router.route('/deleteMany')
.delete(imageHandlerController.deleteManyTinyMCE);


module.exports = router