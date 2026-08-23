require("dotenv").config();

const express = require("express");
const app = express();

const errorMiddleware = require("./middleware/error_handling");
const uploadRoute = require("./routes/uploadRoute");
const authRoute = require("./routes/authRoute");
const propertyRoute = require("./routes/propertyRoute");


require("./config/db_config.js");

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoute);
app.use("/upload", uploadRoute);
app.use("/properties", propertyRoute);

// Error handling middleware — MUST be last
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
});