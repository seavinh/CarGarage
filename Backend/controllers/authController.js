const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Helper: generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @route  POST /api/auth/register
// @desc   Register a new user
// @access Public
const register = async (req, res) => {
    try {
        const { name, email, username, password, role } = req.body;

        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        // Check duplicates
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const user = await User.create({ name, email, username, password, role });
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        console.error('Register error:', err);

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join('; ') });
        }

        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(409).json({ message: `${field} is already registered` });
        }

        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @route  POST /api/auth/login
// @desc   Login with email/username + password
// @access Public
const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: 'Please provide credentials' });
        }

        // Allow login by email OR username
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
        }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        if (user.status === 'Banned') {
            return res.status(403).json({ message: 'Your account has been banned' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                status: user.status,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @route  POST /api/auth/logout
// @desc   Logout (client should discard token; server just confirms)
// @access Private
const logout = async (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

// @route  GET /api/auth/me
// @desc   Get current logged-in user profile
// @access Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, logout, getMe };
