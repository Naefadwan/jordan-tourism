module.exports = function (req, res, next) {
    // req.user is set by authMiddleware
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};
