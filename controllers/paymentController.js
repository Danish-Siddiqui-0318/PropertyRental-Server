const stripe = require("../config/stripe_config");
const PaymentModel = require("../models/PaymentModel");
const {sql, poolPromise} = require("../config/db_config");

exports.createCheckoutSession = async (req, res) => {
    try {

        console.log("=================================");
        console.log("CREATE CHECKOUT SESSION CALLED");
        console.log("User:", req.user);
        console.log("Body:", req.body);
        console.log("=================================");

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

        console.log("Payment ID received:", paymentId);

        const payment = await PaymentModel.getPaymentForCheckout(
            paymentId,
            req.user.userId
        );

        console.log("Payment from database:", payment);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        if (payment.Status !== "Pending") {
            return res.status(400).json({
                message: "This payment has already been processed"
            });
        }

        const amountInPaisa = Math.round(
            Number(payment.Amount) * 100
        );

        console.log("Amount in PKR:", payment.Amount);
        console.log("Amount in paisa:", amountInPaisa);

        console.log("Creating Stripe Checkout Session...");

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

            success_url: "http://localhost:5000/payment/success",
            cancel_url: "http://localhost:5000/payment/cancelled",

            metadata: {
                paymentId: payment.PaymentID.toString(),
                agreementId: payment.AgreementID.toString(),
                renterId: payment.RenterID.toString()
            }
        });

        console.log("Stripe Checkout Session created!");
        console.log("Session ID:", session.id);
        console.log("Checkout URL:", session.url);

        res.status(200).json({
            message: "Stripe checkout session created successfully",
            sessionId: session.id,
            checkoutUrl: session.url
        });

    } catch (error) {

        console.error("CREATE CHECKOUT ERROR:", error);

        res.status(500).json({
            message: "Unable to create Stripe checkout session",
            error: error.message
        });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(
            "Webhook signature verification failed:",
            error.message
        );

        return res.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }

    console.log("Stripe event received:", event.type);

    // Only process completed Checkout Sessions
    if (event.type === "checkout.session.completed") {

        const session = event.data.object;

        console.log("Checkout Session completed:", session.id);
        console.log("Payment status:", session.payment_status);

        // We only update our database after Stripe confirms payment
        if (session.payment_status !== "paid") {
            console.log("Payment is not marked as paid yet.");
            return res.status(200).json({
                received: true
            });
        }

        const paymentId = parseInt(session.metadata.paymentId);

        if (isNaN(paymentId)) {
            console.error("Invalid payment ID in Stripe metadata");

            return res.status(400).json({
                message: "Invalid payment ID"
            });
        }

        console.log("Payment ID:", paymentId);

        let transaction;

        try {
            const pool = await poolPromise;

            transaction = new sql.Transaction(pool);

            await transaction.begin();

            // 1. Get the payment
            const paymentResult = await transaction.request()
                .input("PaymentID", sql.Int, paymentId)
                .query(`
                    SELECT PaymentID,
                           AgreementID,
                           Amount,
                           Status
                    FROM Payments
                    WHERE PaymentID = @PaymentID
                `);

            if (paymentResult.recordset.length === 0) {
                throw new Error("Payment record not found");
            }

            const payment = paymentResult.recordset[0];

            // 2. Check if this Stripe payment was already processed
            const existingTransaction = await transaction.request()
                .input(
                    "TransactionReference",
                    sql.VarChar(255),
                    session.payment_intent || session.id
                )
                .query(`
                    SELECT TransactionID
                    FROM Transactions
                    WHERE TransactionReference = @TransactionReference
                `);

            if (existingTransaction.recordset.length > 0) {
                console.log("Webhook already processed. Skipping duplicate.");

                await transaction.commit();

                return res.status(200).json({
                    received: true,
                    message: "Payment already processed"
                });
            }

            // 3. Make sure the payment is still pending
            if (payment.Status !== "Pending") {
                console.log(
                    `Payment ${paymentId} is already ${payment.Status}`
                );

                await transaction.commit();

                return res.status(200).json({
                    received: true,
                    message: "Payment already processed"
                });
            }

            // 4. Update Payments table
            await transaction.request()
                .input("PaymentID", sql.Int, paymentId)
                .query(`
                    UPDATE Payments
                    SET Status = 'Paid',
                        PaidAt = GETDATE()
                    WHERE PaymentID = @PaymentID
                `);

            // 5. Insert transaction record
            await transaction.request()
                .input("PaymentID", sql.Int, paymentId)
                .input(
                    "TransactionReference",
                    sql.VarChar(255),
                    session.payment_intent || session.id
                )
                .input(
                    "Amount",
                    sql.Decimal(18, 2),
                    payment.Amount
                )
                .input(
                    "PaymentMethod",
                    sql.VarChar(50),
                    "Stripe"
                )
                .input(
                    "Status",
                    sql.VarChar(50),
                    "Completed"
                )
                .input(
                    "TransactionDate",
                    sql.DateTime,
                    new Date()
                )
                .input(
                    "FailureReason",
                    sql.VarChar(255),
                    null
                )
                .query(`
                    INSERT INTO Transactions (PaymentID,
                                              TransactionReference,
                                              Amount,
                                              PaymentMethod,
                                              Status,
                                              TransactionDate,
                                              FailureReason)
                    VALUES (@PaymentID,
                            @TransactionReference,
                            @Amount,
                            @PaymentMethod,
                            @Status,
                            @TransactionDate,
                            @FailureReason)
                `);

            await transaction.commit();

            console.log(
                `Payment ${paymentId} marked as Paid successfully.`
            );

        } catch (error) {

            if (transaction) {
                try {
                    await transaction.rollback();
                } catch (rollbackError) {
                    console.error(
                        "Transaction rollback failed:",
                        rollbackError.message
                    );
                }
            }

            console.error(
                "Webhook database processing failed:",
                error
            );

            return res.status(500).json({
                message: "Payment processing failed"
            });
        }
    }

    res.status(200).json({
        received: true
    });
};

exports.getPayments = async (req, res) => {
    try {

        if (
            req.user.role !== "owner" &&
            req.user.role !== "renter"
        ) {
            return res.status(403).json({
                message: "Only owners and renters can view payment records"
            });
        }

        const payments = await PaymentModel.getPayments(
            req.user.userId,
            req.user.role
        );

        res.status(200).json({
            message: "Payment records retrieved successfully",
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


exports.getPaymentById = async (req, res) => {
    try {

        if (
            req.user.role !== "owner" &&
            req.user.role !== "renter"
        ) {
            return res.status(403).json({
                message: "Only owners and renters can view payment details"
            });
        }

        const paymentId = parseInt(req.params.id);

        if (isNaN(paymentId)) {
            return res.status(400).json({
                message: "Invalid payment ID"
            });
        }

        const payment = await PaymentModel.getPaymentById(
            paymentId,
            req.user.userId,
            req.user.role
        );

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.status(200).json({
            message: "Payment details retrieved successfully",
            payment
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {

        if (
            req.user.role !== "owner" &&
            req.user.role !== "renter"
        ) {
            return res.status(403).json({
                message: "Only owners and renters can view payment history"
            });
        }

        const paymentId = parseInt(req.params.id);

        if (isNaN(paymentId)) {
            return res.status(400).json({
                message: "Invalid payment ID"
            });
        }

        const history = await PaymentModel.getPaymentHistory(
            paymentId,
            req.user.userId,
            req.user.role
        );

        if (!history) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.status(200).json({
            message: "Payment history retrieved successfully",
            payment: history.payment,
            transactions: history.transactions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};