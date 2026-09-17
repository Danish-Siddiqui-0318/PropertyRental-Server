const sql = require("mssql");
const { poolPromise } = require("../config/db_config");

class PaymentModel {

    static async getPaymentForCheckout(paymentId, renterId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PaymentID", sql.Int, paymentId)
            .input("RenterID", sql.Int, renterId)
            .query(`
                SELECT
                    p.PaymentID,
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
}

module.exports = PaymentModel;