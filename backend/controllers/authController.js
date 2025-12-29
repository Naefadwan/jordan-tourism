const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const { sendOTP } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.create(email, otp, 'registration');
        await sendOTP(email, otp);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { fullName, email, password, otp, accountType, companyName, businessLicense, phone, address } = req.body;

        if (!fullName || !email || !password || !otp) {
            return res.status(400).json({ message: 'Please enter all fields including OTP' });
        }

        const isOtpValid = await OTP.verify(email, otp, 'registration');
        if (!isOtpValid) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role and account status based on account type
        const isCompany = accountType === 'business';
        const role = isCompany ? 'company' : 'user';
        const accountStatus = isCompany ? 'pending' : 'approved'; // Companies need approval

        // Validate company fields if business account
        if (isCompany) {
            if (!companyName || !businessLicense || !phone || !address) {
                return res.status(400).json({ message: 'Please provide all company details: company name, business license, phone, and address' });
            }
        }

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role,
            companyName: isCompany ? companyName : null,
            businessLicense: isCompany ? businessLicense : null,
            phone: isCompany ? phone : null,
            address: isCompany ? address : null,
            accountStatus
        });

        await OTP.deleteByEmail(email, 'registration');

        const message = isCompany
            ? 'Company account registered successfully. Your account is pending admin approval.'
            : 'User registered successfully';

        res.status(201).json({ message, requiresApproval: isCompany });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.email, role: user.role, accountStatus: user.account_status } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                account_status: user.account_status,
                company_name: user.company_name
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        // req.user is set by the authMiddleware
        const user = await User.findByEmail(req.user.id); // req.user.id is the email in our current payload
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            accountStatus: user.account_status,
            companyName: user.company_name,
            businessLicense: user.business_license,
            phone: user.phone,
            address: user.address
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};