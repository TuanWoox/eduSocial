const { questionSchema,questionCommentSchema,postSchema,courseSchema, lessonSchema, userSchema, ratingSchema } = require('../joiValidate/validateSchema');
const ExpressError = require('../utils/ExpressError');
const { cloudinary } = require('../cloudinary/postCloud');

module.exports.validateQuestion = async (req, res, next) => {
    const { title, body } = req.body.question;
    const tagsArray = JSON.parse(req.body.question.tags)
            .map(tag => tag.value) // Extract only the 'value' field
            .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags
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
    const tagsArray = JSON.parse(req.body.post.tags)
            .map(tag => tag.value) // Extract only the 'value' field
            .filter(tag => tag.trim() !== ''); // Remove empty or invalid tags
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
module.exports.validateUser = async (req,res,next) => {
    const {name,bio,dateOfBirth,facebook,github,linkedin} = req.body.user;
    const {error} = userSchema.validate({
        user:{
            name,
            bio,
            dateOfBirth,
            socialLinks: {
                facebook,
                github,
                linkedin
            }
        }
    })
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        cloudinary.uploader.destroy(req.file.filename);
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
module.exports.validateRating = async(req,res,next) => {
    const {error} = ratingSchema.validate({
        rating: {
            ...req.body
        }
    })
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        cloudinary.uploader.destroy(req.file.filename);
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}