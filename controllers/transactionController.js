const TransactionModel = require("../models/TransactionModel");


// #34 GET /transactions
exports.getTransactions = async (req, res) => {
    try {

        if (
            req.user.role !== "owner" &&
            req.user.role !== "renter"
        ) {
            return res.status(403).json({
                message: "Only owners and renters can view transactions"
            });
        }

        const transactions = await TransactionModel.getTransactions(
            req.user.userId,
            req.user.role
        );

        res.status(200).json({
            message: "Transaction history retrieved successfully",
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


// #35 GET /transactions/:id
exports.getTransactionById = async (req, res) => {
    try {

        if (
            req.user.role !== "owner" &&
            req.user.role !== "renter"
        ) {
            return res.status(403).json({
                message: "Only owners and renters can view transaction details"
            });
        }

        const transactionId = parseInt(req.params.id);

        if (isNaN(transactionId)) {
            return res.status(400).json({
                message: "Invalid transaction ID"
            });
        }

        const transaction = await TransactionModel.getTransactionById(
            transactionId,
            req.user.userId,
            req.user.role
        );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.status(200).json({
            message: "Transaction details retrieved successfully",
            transaction
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.getOwnerEarnings = async (req, res) => {
    try {

        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only owners can view earnings"
            });
        }

        const earnings = await TransactionModel.getOwnerEarnings(
            req.user.userId
        );

        res.status(200).json({
            message: "Owner earnings retrieved successfully",
            totalEarnings: earnings.totalEarnings,
            transactions: earnings.transactions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};