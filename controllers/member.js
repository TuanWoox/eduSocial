const topic = {
    title: 'Về chúng tôi',
    description: 'Chia sẻ kiến thức, cùng nhau phát triển',
    find: 'bài viết'
}

module.exports.showMember = async (req,res) =>{
    const perPage = 10; // Số lượng
    const page = parseInt(req.query.page) || 1;
    res.render('member/index', {
        topic,
        currentPage: page,
        totalPages: Math.ceil(perPage)
    });
}