const Rating = require('../models/rating');

module.exports.saveRating = async (req,res) => {
    const newRating = new Rating(req.body);
    newRating.courseRated = req.params.id;
    newRating.author = req.user._id;
    await newRating.save();
    res.redirect(`/courses/${req.params.id}`);
}
module.exports.deleteRating = async (req,res) => {
    const deletedRating = await Rating.findByIdAndDelete(req.params.ratingID);
    console.log(deletedRating);
    res.redirect(`/courses/${req.params.id}`);
}