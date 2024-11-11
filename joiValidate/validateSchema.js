const Joi = require('joi');

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
})