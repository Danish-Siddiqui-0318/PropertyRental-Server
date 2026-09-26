const sql = require("mssql");
const { poolPromise } = require("../config/db_config");

class TransactionModel {

    // #34 Get transaction history
    static async getTransactions(userId, role) {
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
            SELECT
                t.TransactionID,
                t.PaymentID,
                t.TransactionReference,
                t.Amount,
                t.PaymentMethod,
                t.Status,
                t.TransactionDate,
                t.FailureReason,
                t.CreatedAt,

                p.AgreementID,
                p.PaymentType,
                p.DueDate,

                ra.PropertyID,
                ra.OwnerID,
                ra.RenterID,

                prop.Title AS PropertyTitle

            FROM Transactions t

            INNER JOIN Payments p
                ON t.PaymentID = p.PaymentID

            INNER JOIN RentalAgreements ra
                ON p.AgreementID = ra.AgreementID

            INNER JOIN Properties prop
                ON ra.PropertyID = prop.PropertyID

            WHERE ${ownershipCondition}

            ORDER BY t.TransactionDate DESC
        `);

        return result.recordset;
    }


    // #35 Get transaction details
    static async getTransactionById(transactionId, userId, role) {
        const pool = await poolPromise;

        const request = pool.request()
            .input("TransactionID", sql.Int, transactionId)
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
            SELECT
                t.TransactionID,
                t.PaymentID,
                t.TransactionReference,
                t.Amount,
                t.PaymentMethod,
                t.Status,
                t.TransactionDate,
                t.FailureReason,
                t.CreatedAt,

                p.AgreementID,
                p.PaymentType,
                p.DueDate,
                p.Status AS PaymentStatus,
                p.PaidAt,

                ra.PropertyID,
                ra.OwnerID,
                ra.RenterID,
                ra.StartDate,
                ra.EndDate,
                ra.MonthlyRent,
                ra.SecurityDeposit,

                prop.Title AS PropertyTitle

            FROM Transactions t

            INNER JOIN Payments p
                ON t.PaymentID = p.PaymentID

            INNER JOIN RentalAgreements ra
                ON p.AgreementID = ra.AgreementID

            INNER JOIN Properties prop
                ON ra.PropertyID = prop.PropertyID

            WHERE t.TransactionID = @TransactionID
              AND ${ownershipCondition}
        `);

        return result.recordset[0] || null;
    }
    static async getOwnerEarnings(ownerId) {
        const pool = await poolPromise;

        const request = pool.request()
            .input("OwnerID", sql.Int, ownerId);

        const result = await request.query(`
        SELECT
            t.TransactionID,
            t.PaymentID,
            t.TransactionReference,
            t.Amount,
            t.PaymentMethod,
            t.Status,
            t.TransactionDate,

            p.AgreementID,
            p.PaymentType,

            ra.PropertyID,

            prop.Title AS PropertyTitle

        FROM Transactions t

        INNER JOIN Payments p
            ON t.PaymentID = p.PaymentID

        INNER JOIN RentalAgreements ra
            ON p.AgreementID = ra.AgreementID

        INNER JOIN Properties prop
            ON ra.PropertyID = prop.PropertyID

        WHERE ra.OwnerID = @OwnerID
          AND t.Status = 'Completed'

        ORDER BY t.TransactionDate DESC
    `);

        const totalEarnings = result.recordset.reduce(
            (total, transaction) => {
                return total + Number(transaction.Amount);
            },
            0
        );

        return {
            totalEarnings,
            transactions: result.recordset
        };
    }
}

module.exports = TransactionModel;