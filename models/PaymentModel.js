const sql = require("mssql");
const {poolPromise} = require("../config/db_config");

class PaymentModel {

    static async getPaymentForCheckout(paymentId, renterId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PaymentID", sql.Int, paymentId)
            .input("RenterID", sql.Int, renterId)
            .query(`
                SELECT p.PaymentID,
                       p.AgreementID,
                       p.Amount,
                       p.DueDate,
                       p.PaymentType,
                       p.Status,
                       ra.PropertyID,
                       ra.RenterID,
                       ra.OwnerID
                FROM Payments p
                         INNER JOIN RentalAgreements ra
                                    ON p.AgreementID = ra.AgreementID
                WHERE p.PaymentID = @PaymentID
                  AND ra.RenterID = @RenterID
            `);

        return result.recordset[0] || null;
    }

    static async getPayments(userId, role) {
        const pool = await poolPromise;

        const request = pool.request()
            .input("UserID", sql.Int, userId);

        let ownershipCondition;

        if (role === "owner") {
            ownershipCondition = "ra.OwnerID = @UserID";
        } else if (role === "renter") {
            ownershipCondition = "ra.RenterID = @UserID";
        } else {
            return [];
        }

        const result = await request.query(`
            SELECT p.PaymentID,
                   p.AgreementID,
                   p.Amount,
                   p.DueDate,
                   p.PaymentType,
                   p.Status,
                   p.PaidAt,
                   p.CreatedAt,

                   ra.PropertyID,
                   ra.OwnerID,
                   ra.RenterID,

                   prop.Title AS PropertyTitle

            FROM Payments p

                     INNER JOIN RentalAgreements ra
                                ON p.AgreementID = ra.AgreementID

                     INNER JOIN Properties prop
                                ON ra.PropertyID = prop.PropertyID

            WHERE ${ownershipCondition}

            ORDER BY p.CreatedAt DESC
        `);

        return result.recordset;
    }


    static async getPaymentById(paymentId, userId, role) {
        const pool = await poolPromise;

        const request = pool.request()
            .input("PaymentID", sql.Int, paymentId)
            .input("UserID", sql.Int, userId);

        let ownershipCondition;

        if (role === "owner") {
            ownershipCondition = "ra.OwnerID = @UserID";
        } else if (role === "renter") {
            ownershipCondition = "ra.RenterID = @UserID";
        } else {
            return null;
        }

        const result = await request.query(`
            SELECT p.PaymentID,
                   p.AgreementID,
                   p.Amount,
                   p.DueDate,
                   p.PaymentType,
                   p.Status,
                   p.PaidAt,
                   p.CreatedAt,

                   ra.PropertyID,
                   ra.OwnerID,
                   ra.RenterID,
                   ra.StartDate,
                   ra.EndDate,
                   ra.MonthlyRent,
                   ra.SecurityDeposit,

                   prop.Title AS PropertyTitle

            FROM Payments p

                     INNER JOIN RentalAgreements ra
                                ON p.AgreementID = ra.AgreementID

                     INNER JOIN Properties prop
                                ON ra.PropertyID = prop.PropertyID

            WHERE p.PaymentID = @PaymentID
              AND ${ownershipCondition}
        `);

        return result.recordset[0] || null;
    }

    static async getPaymentHistory(paymentId, userId, role) {
        const pool = await poolPromise;

        const request = pool.request()
            .input("PaymentID", sql.Int, paymentId)
            .input("UserID", sql.Int, userId);

        let ownershipCondition;

        if (role === "owner") {
            ownershipCondition = "ra.OwnerID = @UserID";
        } else if (role === "renter") {
            ownershipCondition = "ra.RenterID = @UserID";
        } else {
            return null;
        }

        const result = await request.query(`
            SELECT p.PaymentID,
                   p.AgreementID,
                   p.Amount,
                   p.DueDate,
                   p.PaymentType,
                   p.Status    AS PaymentStatus,
                   p.PaidAt,
                   p.CreatedAt AS PaymentCreatedAt,

                   ra.PropertyID,
                   ra.OwnerID,
                   ra.RenterID,

                   prop.Title  AS PropertyTitle,

                   t.TransactionID,
                   t.TransactionReference,
                   t.Amount    AS TransactionAmount,
                   t.PaymentMethod,
                   t.Status    AS TransactionStatus,
                   t.TransactionDate,
                   t.FailureReason,
                   t.CreatedAt AS TransactionCreatedAt

            FROM Payments p

                     INNER JOIN RentalAgreements ra
                                ON p.AgreementID = ra.AgreementID

                     INNER JOIN Properties prop
                                ON ra.PropertyID = prop.PropertyID

                     LEFT JOIN Transactions t
                               ON p.PaymentID = t.PaymentID

            WHERE p.PaymentID = @PaymentID
              AND ${ownershipCondition}

            ORDER BY t.TransactionDate DESC
        `);

        if (result.recordset.length === 0) {
            return null;
        }

        const firstRow = result.recordset[0];

        const payment = {
            PaymentID: firstRow.PaymentID,
            AgreementID: firstRow.AgreementID,
            Amount: firstRow.Amount,
            DueDate: firstRow.DueDate,
            PaymentType: firstRow.PaymentType,
            Status: firstRow.PaymentStatus,
            PaidAt: firstRow.PaidAt,
            CreatedAt: firstRow.PaymentCreatedAt,
            PropertyID: firstRow.PropertyID,
            OwnerID: firstRow.OwnerID,
            RenterID: firstRow.RenterID,
            PropertyTitle: firstRow.PropertyTitle
        };

        const transactions = result.recordset
            .filter(row => row.TransactionID !== null)
            .map(row => ({
                TransactionID: row.TransactionID,
                TransactionReference: row.TransactionReference,
                Amount: row.TransactionAmount,
                PaymentMethod: row.PaymentMethod,
                Status: row.TransactionStatus,
                TransactionDate: row.TransactionDate,
                FailureReason: row.FailureReason,
                CreatedAt: row.TransactionCreatedAt
            }));

        return {
            payment,
            transactions
        };
    }
}

module.exports = PaymentModel;