const sql = require("mssql");
const { poolPromise } = require("../config/db_config");

class AdminModel {

    static async getUsers() {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                UserID,
                Name,
                Email,
                Role,
                Phone,
                CreatedAt
            FROM Users
            ORDER BY CreatedAt DESC
        `);

        return result.recordset;
    }
    static async getUserById(userId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .query(`
            SELECT
                UserID,
                Name,
                Email,
                Role,
                Phone,
                CreatedAt
            FROM Users
            WHERE UserID = @UserID
        `);

        return result.recordset[0] || null;
    }
    static async getProperties() {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            SELECT
                p.PropertyID,
                p.OwnerID,
                u.Name AS OwnerName,
                u.Email AS OwnerEmail,
                p.Title,
                p.Description,
                p.PropertyType,
                p.Address,
                p.City,
                p.Bedrooms,
                p.Bathrooms,
                p.MonthlyRent,
                p.Status,
                p.CreatedAt
            FROM Properties p
                     INNER JOIN Users u
                                ON p.OwnerID = u.UserID
            ORDER BY p.CreatedAt DESC
        `);

        return result.recordset;
    }
    static async getRentals() {
        const pool = await poolPromise;

        const result = await pool.request().query(`
        SELECT
            ra.AgreementID,
            ra.PropertyID,
            prop.Title AS PropertyTitle,

            ra.OwnerID,
            owner.Name AS OwnerName,
            owner.Email AS OwnerEmail,

            ra.RenterID,
            renter.Name AS RenterName,
            renter.Email AS RenterEmail,

            ra.StartDate,
            ra.EndDate,
            ra.MonthlyRent,
            ra.SecurityDeposit,
            ra.PaymentDueDay,
            ra.Status,
            ra.CreatedAt

        FROM RentalAgreements ra

        INNER JOIN Properties prop
            ON ra.PropertyID = prop.PropertyID

        INNER JOIN Users owner
            ON ra.OwnerID = owner.UserID

        INNER JOIN Users renter
            ON ra.RenterID = renter.UserID

        ORDER BY ra.CreatedAt DESC
    `);

        return result.recordset;
    }


    static async getPayments() {
        const pool = await poolPromise;

        const result = await pool.request().query(`
        SELECT
            p.PaymentID,
            p.AgreementID,
            p.Amount,
            p.DueDate,
            p.PaymentType,
            p.Status,
            p.PaidAt,
            p.CreatedAt,

            ra.PropertyID,
            prop.Title AS PropertyTitle,

            ra.OwnerID,
            owner.Name AS OwnerName,
            owner.Email AS OwnerEmail,

            ra.RenterID,
            renter.Name AS RenterName,
            renter.Email AS RenterEmail

        FROM Payments p

        INNER JOIN RentalAgreements ra
            ON p.AgreementID = ra.AgreementID

        INNER JOIN Properties prop
            ON ra.PropertyID = prop.PropertyID

        INNER JOIN Users owner
            ON ra.OwnerID = owner.UserID

        INNER JOIN Users renter
            ON ra.RenterID = renter.UserID

        ORDER BY p.CreatedAt DESC
    `);

        return result.recordset;
    }


    static async getTransactions() {
        const pool = await poolPromise;

        const result = await pool.request().query(`
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
            prop.Title AS PropertyTitle,

            ra.OwnerID,
            owner.Name AS OwnerName,
            owner.Email AS OwnerEmail,

            ra.RenterID,
            renter.Name AS RenterName,
            renter.Email AS RenterEmail

        FROM Transactions t

        INNER JOIN Payments p
            ON t.PaymentID = p.PaymentID

        INNER JOIN RentalAgreements ra
            ON p.AgreementID = ra.AgreementID

        INNER JOIN Properties prop
            ON ra.PropertyID = prop.PropertyID

        INNER JOIN Users owner
            ON ra.OwnerID = owner.UserID

        INNER JOIN Users renter
            ON ra.RenterID = renter.UserID

        ORDER BY t.TransactionDate DESC
    `);

        return result.recordset;
    }
}

module.exports = AdminModel;