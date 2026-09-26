require("dotenv").config();

const express = require("express");
const app = express();

const errorMiddleware = require("./middleware/error_handling");
const uploadRoute = require("./routes/uploadRoute");
const authRoute = require("./routes/authRoute");
const propertyRoute = require("./routes/propertyRoute");
const rentalRoute = require("./routes/rentalRoute");
const paymentRoute = require("./routes/paymentRoute");
const paymentPageRoute = require("./routes/paymentPageRoute");
const transactionRoute = require("./routes/transactionRoute");
const adminRoute = require("./routes/adminRoute");


require("./config/db_config.js");

const PORT = process.env.PORT || 5000;

const paymentController = require("./controllers/paymentController");

app.post(
    "/payments/webhook",
    express.raw({ type: "application/json" }),
    paymentController.handleWebhook
);


// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoute);
app.use("/upload", uploadRoute);
app.use("/properties", propertyRoute);
app.use("/rentals", rentalRoute);
app.use("/payments", paymentRoute);
app.use("/payment", paymentPageRoute);
app.use("/transactions", transactionRoute);
app.use("/admin", adminRoute);

// Error handling middleware — MUST be last
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
});

// stripe listen --forward-to localhost:5000/payments/webhook