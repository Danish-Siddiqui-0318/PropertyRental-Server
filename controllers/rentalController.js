const RentalAgreementModel = require("../models/RentalAgreementModel");

exports.createRentalRequest = async (req, res) => {
    try {

        if (req.user.role !== "renter") {
            return res.status(403).json({
                message: "Only renters can submit rental requests"
            });
        }

        const {
            propertyId,
            startDate,
            endDate,
            monthlyRent,
            securityDeposit,
            paymentDueDay
        } = req.body;

        // Validate required fields
        if (
            !propertyId ||
            !startDate ||
            !endDate ||
            monthlyRent === undefined ||
            securityDeposit === undefined ||
            !paymentDueDay
        ) {
            return res.status(400).json({
                message: "All rental details are required"
            });
        }

        // Basic date validation
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                message: "End date must be after start date"
            });
        }

        // Payment due day validation
        if (paymentDueDay < 1 || paymentDueDay > 28) {
            return res.status(400).json({
                message: "Payment due day must be between 1 and 28"
            });
        }

        const result = await RentalAgreementModel.createRentalRequest(
            parseInt(propertyId),
            req.user.userId,
            startDate,
            endDate,
            monthlyRent,
            securityDeposit,
            paymentDueDay
        );

        if (result.error === "PROPERTY_NOT_FOUND") {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        if (result.error === "PROPERTY_NOT_AVAILABLE") {
            return res.status(400).json({
                message: "Property is not available for rent"
            });
        }

        if (result.error === "REQUEST_ALREADY_EXISTS") {
            return res.status(400).json({
                message: "You already have a pending or active rental for this property"
            });
        }

        res.status(201).json({
            message: "Rental request submitted successfully",
            agreement: result.agreement
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
        if (
            req.user.role !== "owner" &&
            req.user.role !== "renter"
        ) {
            return res.status(403).json({
                message: "Only owners and renters can access rental agreements"
            });
        }

        const rentals = await RentalAgreementModel.getRentals(
            req.user.userId,
            req.user.role
        );

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
exports.getRentalById = async (req, res) => {
    try {
        if (
            req.user.role !== "owner" &&
            req.user.role !== "renter"
        ) {
            return res.status(403).json({
                message: "Only owners and renters can access rental agreements"
            });
        }

        const agreementId = parseInt(req.params.id);

        if (isNaN(agreementId)) {
            return res.status(400).json({
                message: "Invalid agreement ID"
            });
        }

        const rental = await RentalAgreementModel.getRentalById(
            agreementId,
            req.user.userId,
            req.user.role
        );

        if (!rental) {
            return res.status(404).json({
                message: "Rental agreement not found"
            });
        }

        res.status(200).json({
            message: "Rental agreement retrieved successfully",
            rental
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.approveRental = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only owners can approve rental requests"
            });
        }

        const agreementId = parseInt(req.params.id);

        if (isNaN(agreementId)) {
            return res.status(400).json({
                message: "Invalid agreement ID"
            });
        }

        const result = await RentalAgreementModel.approveRental(
            agreementId,
            req.user.userId
        );

        if (result.error === "RENTAL_NOT_FOUND") {
            return res.status(404).json({
                message: "Rental agreement not found"
            });
        }

        if (result.error === "RENTAL_NOT_PENDING") {
            return res.status(400).json({
                message: "Only pending rental requests can be approved"
            });
        }

        if (result.error === "PROPERTY_NOT_FOUND") {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        if (result.error === "PROPERTY_NOT_AVAILABLE") {
            return res.status(400).json({
                message: "Property is no longer available"
            });
        }

        res.status(200).json({
            message: "Rental request approved successfully",
            agreementId: result.agreementId,
            propertyId: result.propertyId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};