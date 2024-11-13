const BaseJoi = require('joi');
const xss = require('xss');

// Extend Joi to add escapeXSS rule
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeXSS': '{{#label}} contains potentially harmful content!'
    },
    rules: {
        escapeXSS: {
            validate(value, helpers) {
                const clean = xss(value); // Sanitize the input using xss library

                if (clean !== value) return helpers.error('string.escapeXSS', { value });

                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);


module.exports.questionSchema = Joi.object({
    question: Joi.object({
        title: Joi.string().required(),
        body: Joi.string().required(),
    }).required(),
    tags: Joi.array().items(Joi.string()).required() // Ensure tags is an array of strings
});

module.exports.questionCommentSchema = Joi.object({
    questionComment: Joi.object({
        body: Joi.string().required(),
        replyto: Joi.string()
    }).required()
});

module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        content: Joi.string().escapeXSS().required()
    }).required(),
    tags: Joi.array().items(Joi.string()).required()
});

module.exports.courseSchema = Joi.object({
    course: Joi.object({
        title: Joi.string().required(),
        topic: Joi.string().valid('Coding', 'IT & Software', 'English').required(), // Restrict topic to 3 values
        description: Joi.string().required(),
    }).required()
});

module.exports.lessonSchema = Joi.object({
    lesson: Joi.object({
        title: Joi.string().required(),
        content: Joi.string().escapeXSS().required()
    }).required(),
})

module.exports.userSchema = Joi.object({
    user: Joi.object({
        name: Joi.string().required(),
        bio: Joi.string().required(),
        dateOfBirth: Joi.date().less('now').required(), // Ensures the date is not in the future
        socialLinks: Joi.object({
            facebook: Joi.string().uri().regex(/^https:\/\/(www\.)?facebook\.com\//).allow('').optional(),
            github: Joi.string().uri().regex(/^https:\/\/(www\.)?github\.com\//).allow('').optional(),
            linkedin: Joi.string().uri().regex(/^https:\/\/(www\.)?linkedin\.com\//).allow('').optional(),
        }).optional()  // Make the entire socialLinks object optional
    })
});
