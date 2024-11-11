const { questionSchema,questionCommentSchema } = require('../joiValidate/validateSchema');
const ExpressError = require('../utils/ExpressError');
module.exports.validateQuestion = async (req, res, next) => {
    const { title, body } = req.body.question;
    const tagsArray = req.body.question.tags.split(' ').filter(tag => tag.trim() !== ''); // Split and filter tags
    const { error } = questionSchema.validate(
        {
            question: {
                title,
                body
            },
            tags: tagsArray
        },
    );
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
module.exports.validateQuestionComment = async (req, res, next) => {
    const { error } = questionCommentSchema.validate( {
        questionComment: {
            body: req.body.answer.body,
            replyto: req.body.answer.replyto
        }
    });
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
