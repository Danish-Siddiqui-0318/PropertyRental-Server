const AdminModel = require("../models/AdminModel");

exports.getUsers = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can view users"
            });
        }

        const users = await AdminModel.getUsers();

        res.status(200).json({
            message: "Users retrieved successfully",
            users
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
exports.getUserById = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can view users"
            });
        }

        const userId = parseInt(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await AdminModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.getProperties = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can view properties"
            });
        }

        const properties = await AdminModel.getProperties();

        res.status(200).json({
            message: "Properties retrieved successfully",
            properties
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
exports.getRentals = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can view rentals"
            });
        }

        const rentals = await AdminModel.getRentals();

        res.status(200).json({
            message: "Rentals retrieved successfully",
            rentals
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
exports.getPayments = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can view payments"
            });
        }

        const payments = await AdminModel.getPayments();

        res.status(200).json({
            message: "Payments retrieved successfully",
            payments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
exports.getTransactions = async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can view transactions"
            });
        }

        const transactions = await AdminModel.getTransactions();

        res.status(200).json({
            message: "Transactions retrieved successfully",
            transactions
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};