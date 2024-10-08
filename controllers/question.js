const Question = require('../models/question')
const topic = {
    title: 'Hỏi đáp',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'câu hỏi'
}
module.exports.index = async (req,res) => {
    const questions = await Question.find({});
    console.log(questions)
    res.render('questions/index',{topic,questions})
}