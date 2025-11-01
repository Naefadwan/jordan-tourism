const Like = require('../models/likeModel');
const User = require('../models/userModel');

exports.getLikes = async (req, res) => {
    try {
        // req.user.id is the email from the JWT payload
        const user = await User.findByEmail(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const likedAttractions = await Like.findByUserId(user.id);
        res.json(likedAttractions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addLike = async (req, res) => {
    try {
        const user = await User.findByEmail(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { attractionId } = req.params;
        await Like.add(user.id, attractionId);
        res.status(201).json({ message: 'Like added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.removeLike = async (req, res) => {
    try {
        const user = await User.findByEmail(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { attractionId } = req.params;
        await Like.remove(user.id, attractionId);
        res.status(200).json({ message: 'Like removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};