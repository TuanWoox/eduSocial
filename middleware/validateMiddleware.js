const { questionSchema,questionCommentSchema,postSchema,courseSchema, lessonSchema } = require('../joiValidate/validateSchema');
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
module.exports.validatePost = async (req,res,next) => {
    const {title,content} = req.body.post;
    const tagsArray = req.body.post.tags.split(' ').filter(tag => tag.trim() !== ''); // Split and filter tags
    const {error} = postSchema.validate( {
        post: {
            title,
            content
        },
        tags: tagsArray
    })
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
module.exports.validateCourse = async (req,res,next) => {
    console.log(req.body)
    const {title,description,topic} = req.body.course;
    const { error } = courseSchema.validate( {
        course: {
            title,
            description,
            topic,
        }
    })
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
module.exports.validateLesson = async (req,res,next) => {
    const {content,title} = req.body.course;
    const {error } = lessonSchema.validate( {
        lesson: {
            title,
            content
        }
    })
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}