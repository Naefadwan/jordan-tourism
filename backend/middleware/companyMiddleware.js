module.exports = function (req, res, next) {
    // req.user is set by authMiddleware
    if (req.user && (req.user.role === 'admin' || req.user.role === 'company')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Company or Admin privileges required.' });
    }
};
