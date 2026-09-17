const stripe = require("../config/stripe_config");
const PaymentModel = require("../models/PaymentModel");

exports.createCheckoutSession = async (req, res) => {
    try {

        // Only renters can make rental payments
        if (req.user.role !== "renter") {
            return res.status(403).json({
                message: "Only renters can make payments"
            });
        }

        const paymentId = parseInt(req.body.paymentId);

        if (isNaN(paymentId)) {
            return res.status(400).json({
                message: "Invalid payment ID"
            });
        }

        // Get payment belonging to logged-in renter
        const payment = await PaymentModel.getPaymentForCheckout(
            paymentId,
            req.user.userId
        );

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        // Payment must still be pending
        if (payment.Status !== "Pending") {
            return res.status(400).json({
                message: "This payment has already been processed"
            });
        }

        // Stripe uses the smallest currency unit.
        // PKR has 2 decimal places, so multiply by 100.
        const amountInPaisa = Math.round(
            Number(payment.Amount) * 100
        );

        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            line_items: [
                {
                    price_data: {
                        currency: "pkr",

                        product_data: {
                            name: payment.PaymentType === "SecurityDeposit"
                                ? "Security Deposit"
                                : "Monthly Rent"
                        },

                        unit_amount: amountInPaisa
                    },

                    quantity: 1
                }
            ],

            success_url: "http://localhost:3000/payment-success",
            cancel_url: "http://localhost:3000/payment-cancelled",

            metadata: {
                paymentId: payment.PaymentID.toString(),
                agreementId: payment.AgreementID.toString(),
                renterId: payment.RenterID.toString()
            }
        });

        res.status(200).json({
            message: "Stripe checkout session created successfully",
            sessionId: session.id,
            checkoutUrl: session.url
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to create Stripe checkout session",
            error: error.message
        });
    }
};