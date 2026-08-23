const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');


exports.signup = async (req, res) => {

    const {name, email, password, role, phone} = req.body;

    try {

        // Basic validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: 'Name, email, password and role are required'
            });
        }

        // Check if email already exists
        const existingUser = await UserModel.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                message: 'Email is already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        await UserModel.create({
            name,
            email,
            hashedPassword,
            role,
            phone
        });

        // Do not return user details
        res.status(201).json({
            message: 'User registered successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


exports.login = async (req, res) => {

    const {email, password} = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.PasswordHash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user.UserID,
                role: user.Role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        // Return only message and JWT
        res.status(200).json({
            message: 'Login successful',
            token
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            user: {
                id: user.UserID,
                name: user.Name,
                email: user.Email,
                role: user.Role,
                phone: user.Phone,
                createdAt: user.CreatedAt
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        })
    }
}

exports.updateProfile = async (req, res) => {
    const {name, email, phone} = req.body;

    try {
        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            })
        }

        const existingUser = await UserModel.findByEmail(email);

        if (existingUser && existingUser.UserID !== req.user.userId) {
            return res.status(400).json({
                message: "Email is already registered"
            })
        }

        const updatedUser = await UserModel.updateProfile(
            req.user.userId,
            {
                name,
                email,
                phone
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        res.status(200).json({
            message: "Profile updated successfully",
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

exports.changePassword = async (req, res) => {
    const {currentPassword, newPassword} = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Current Password and new Password are required'
            })
        }
        const user = await UserModel.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        const isMatch = await bcrypt.compare(currentPassword, user.PasswordHash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Current Password is incorrect"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
            newPassword,
            salt
        )

        const updated = await UserModel.changePassword(
            req.user.userId,
            hashedPassword
        )

        if (!updated) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        res.status(200).json({
            message: 'Password changed successfully'
        })
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        })
    }
}