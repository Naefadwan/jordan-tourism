module.exports = function (req, res, next) {
    // req.user is set by authMiddleware
    if (req.user && (req.user.role === 'admin' || req.user.role === 'company')) {
        // For company users, also check if their account is approved
        if (req.user.role === 'company') {
            if (req.user.accountStatus === 'pending') {
                return res.status(403).json({
                    message: 'Your company account is pending approval. You cannot create or modify content until approved by an admin.',
                    accountStatus: 'pending'
                });
            }
            if (req.user.accountStatus === 'rejected') {
                return res.status(403).json({
                    message: 'Your company account has been rejected. Please contact support for more information.',
                    accountStatus: 'rejected'
                });
            }
        }
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Company or Admin privileges required.' });
    }
};
