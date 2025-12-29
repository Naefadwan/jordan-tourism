const User = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
    try {
        const { role, accountStatus } = req.query;
        const filters = {};

        if (role) filters.role = role;
        if (accountStatus) filters.accountStatus = accountStatus;

        const users = await User.findAll(filters);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.delete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, role } = req.body; // Expecting full_name from frontend

        // Basic validation
        if (!full_name || !email || !role) {
            return res.status(400).json({ message: 'Please provide full name, email and role' });
        }

        const updatedUser = await User.update(id, { fullName: full_name, email, role });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.updateAccountStatus(id, 'approved');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (updatedUser.role !== 'company') {
            return res.status(400).json({ message: 'User is not a company account' });
        }

        res.json({ message: 'Company account approved successfully', user: updatedUser });
    } catch (error) {
        console.error('Error approving company:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.updateAccountStatus(id, 'rejected');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (updatedUser.role !== 'company') {
            return res.status(400).json({ message: 'User is not a company account' });
        }

        res.json({ message: 'Company account rejected successfully', user: updatedUser });
    } catch (error) {
        console.error('Error rejecting company:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
