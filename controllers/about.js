const topic = {
    title: 'Về chúng tôi',
    description: 'EduSocial là nền tảng kết nối học sinh, sinh viên và các giảng viên, giúp trao đổi kiến thức và phát triển kỹ năng nghề nghiệp.',
    find: 'bài viết'
}

module.exports.showAbout = async (req,res) =>{
    const perPage = 10; // Số lượng
    const page = parseInt(req.query.page) || 1;
    res.render('about/index', {
        topic,
        currentPage: page,
        totalPages: Math.ceil(perPage)
    });
}