const express = require("express");

const router = express.Router();

router.get("/success", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Successful</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding-top: 100px;
                }

                h1 {
                    color: green;
                }

                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>

        <body>
            <h1>Payment Successful!</h1>
            <p>Your payment has been completed.</p>

            <a href="http://localhost:5000">
                Return to PropertyRental
            </a>
        </body>
        </html>
    `);
});

router.get("/cancelled", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Cancelled</title>
        </head>

        <body style="font-family: Arial; text-align: center; padding-top: 100px;">
            <h1>Payment Cancelled</h1>
            <p>Your payment was cancelled.</p>
        </body>
        </html>
    `);
});

module.exports = router;