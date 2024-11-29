const User = require('../models/User');
const Chat = require('../models/chat');
const chatTopic = {
    title: 'Chat',
    description: 'Trò chuyện cùng mọi người',
    find: 'tag',
}
module.exports.showMessage = async (req,res) => {
    const id = req.params.id;
    const receiver = await User.findById(id);
    const chats = await Chat.find({$or:[
        {sender_id: req.user._id, receiver_id: id },
        {sender_id: id , receiver_id: req.user._id}
    ]});
    res.render('chat/show', {
        topic: chatTopic,
        receiver,
        chats
    });
}
module.exports.saveChat = async(req,res) => {
    try {
        console.log('Hi');
        var chat = new Chat({
            sender_id:req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message,
        })
        var newChat = await chat.save();
        const sender = await User.findById(req.body.sender_id);
        const receiver = await User.findById(req.body.receiver_id);
        sender.messagesList.pull(receiver._id); // Remove if exists
        sender.messagesList.unshift(receiver._id); // Add to the top
        await sender.save();
        receiver.messagesList.pull(sender._id); // Remove if exists
        receiver.messagesList.unshift(sender._id); // Add to the top
        await receiver.save();

        res.status(200).send({success: true, msg:'Chat inserted', data:newChat}) 
    } catch(error) {
        res.status(400).send({success: false, msg:error.message})
    }
}
module.exports.showHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('messagesList');

        // Retrieve chat history for each user in messagesList
        const chatUsers = await Promise.all(
            user.messagesList.map(async (chatUserId) => {
                const chatUser = await User.findById(chatUserId).select('name profilePic is_online');
                const lastMessage = await Chat.findOne({
                    $or: [
                        { sender_id: req.user._id, receiver_id: chatUserId },
                        { sender_id: chatUserId, receiver_id: req.user._id }
                    ]
                })
                .sort({ createdAt: -1 }) // Get the most recent message
                .select('message');

                return {
                    _id: chatUser._id,
                    name: chatUser.name,
                    profilePic: chatUser.profilePic,
                    lastMessage: lastMessage ? lastMessage.message : 'No messages yet',
                    is_online: chatUser.is_online,
                };
            })
        );
        res.render('chat/index', {topic: chatTopic, chatUsers });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
