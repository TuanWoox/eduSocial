const express = require('express');
const { auth, isAdmin } = require('../middleware/authMiddleware'); // Import middleware
const router = express.Router();
// Route dành cho admin
router.get('/admin', auth, isAdmin, (req, res) => {
    res.render('AdminPage', { user: req.user });
});
module.exports = router;