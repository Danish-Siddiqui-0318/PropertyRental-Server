const sql = require("mssql");
const {poolPromise} = require("../config/db_config");

class RentalAgreementModel {

    static async createRentalRequest(
        propertyId,
        renterId,
        startDate,
        endDate,
        monthlyRent,
        securityDeposit,
        paymentDueDay
    ) {
        const pool = await poolPromise;

        // Check property and get its owner
        const propertyResult = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .query(`
                SELECT PropertyID, OwnerID, Status
                FROM Properties
                WHERE PropertyID = @PropertyID
            `);

        if (propertyResult.recordset.length === 0) {
            return {
                error: "PROPERTY_NOT_FOUND"
            };
        }

        const property = propertyResult.recordset[0];

        // Property must be available
        if (property.Status !== "available") {
            return {
                error: "PROPERTY_NOT_AVAILABLE"
            };
        }

        // Prevent duplicate pending/active requests
        const existingResult = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .input("RenterID", sql.Int, renterId)
            .query(`
                SELECT AgreementID
                FROM RentalAgreements
                WHERE PropertyID = @PropertyID
                  AND RenterID = @RenterID
                  AND Status IN ('Pending', 'Active')
            `);

        if (existingResult.recordset.length > 0) {
            return {
                error: "REQUEST_ALREADY_EXISTS"
            };
        }

        // Create rental request
        const result = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .input("OwnerID", sql.Int, property.OwnerID)
            .input("RenterID", sql.Int, renterId)
            .input("StartDate", sql.Date, startDate)
            .input("EndDate", sql.Date, endDate)
            .input("MonthlyRent", sql.Decimal(10, 2), monthlyRent)
            .input("SecurityDeposit", sql.Decimal(10, 2), securityDeposit)
            .input("PaymentDueDay", sql.Int, paymentDueDay)
            .query(`
                INSERT INTO RentalAgreements (PropertyID,
                                              OwnerID,
                                              RenterID,
                                              StartDate,
                                              EndDate,
                                              MonthlyRent,
                                              SecurityDeposit,
                                              PaymentDueDay,
                                              Status)
                    OUTPUT INSERTED.AgreementID,
                    INSERTED.PropertyID,
                    INSERTED.OwnerID,
                    INSERTED.RenterID,
                    INSERTED.StartDate,
                    INSERTED.EndDate,
                    INSERTED.MonthlyRent,
                    INSERTED.SecurityDeposit,
                    INSERTED.PaymentDueDay,
                    INSERTED.Status,
                    INSERTED.CreatedAt
                VALUES (
                    @PropertyID, @OwnerID, @RenterID, @StartDate, @EndDate, @MonthlyRent, @SecurityDeposit, @PaymentDueDay, 'Pending'
                    )
            `);

        return {
            error: null,
            agreement: result.recordset[0]
        };
    }

    static async getRentals(userId, role) {
        const pool = await poolPromise;

        const request = pool.request()
            .input("UserID", sql.Int, userId);

        let query = `
            SELECT ra.AgreementID,
                   ra.PropertyID,
                   ra.OwnerID,
                   ra.RenterID,
                   ra.StartDate,
                   ra.EndDate,
                   ra.MonthlyRent,
                   ra.SecurityDeposit,
                   ra.PaymentDueDay,
                   ra.Status,
                   ra.CreatedAt,

                   p.Title      AS PropertyTitle,

                   owner.Name   AS OwnerName,
                   owner.Email  AS OwnerEmail,
                   owner.Phone  AS OwnerPhone,

                   renter.Name  AS RenterName,
                   renter.Email AS RenterEmail,
                   renter.Phone AS RenterPhone

            FROM RentalAgreements ra

                     INNER JOIN Properties p
                                ON ra.PropertyID = p.PropertyID

                     INNER JOIN Users owner
                                ON ra.OwnerID = owner.UserID

                     INNER JOIN Users renter
                                ON ra.RenterID = renter.UserID
        `;

        if (role === "owner") {
            query += `
            WHERE ra.OwnerID = @UserID
        `;
        } else if (role === "renter") {
            query += `
            WHERE ra.RenterID = @UserID
        `;
        }

        query += `
        ORDER BY ra.CreatedAt DESC
    `;

        const result = await request.query(query);

        return result.recordset;
    }

    static async getRentalById(agreementId, userId, role) {
        const pool = await poolPromise;

        const request = pool.request()
            .input("AgreementID", sql.Int, agreementId)
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
            SELECT ra.AgreementID,
                   ra.PropertyID,
                   ra.OwnerID,
                   ra.RenterID,
                   ra.StartDate,
                   ra.EndDate,
                   ra.MonthlyRent,
                   ra.SecurityDeposit,
                   ra.PaymentDueDay,
                   ra.Status,
                   ra.CreatedAt,

                   p.Title      AS PropertyTitle,

                   owner.Name   AS OwnerName,
                   owner.Email  AS OwnerEmail,
                   owner.Phone  AS OwnerPhone,

                   renter.Name  AS RenterName,
                   renter.Email AS RenterEmail,
                   renter.Phone AS RenterPhone

            FROM RentalAgreements ra

                     INNER JOIN Properties p
                                ON ra.PropertyID = p.PropertyID

                     INNER JOIN Users owner
                                ON ra.OwnerID = owner.UserID

                     INNER JOIN Users renter
                                ON ra.RenterID = renter.UserID

            WHERE ra.AgreementID = @AgreementID
              AND ${ownershipCondition}
        `);

        return result.recordset[0] || null;
    }

    static async approveRental(agreementId, ownerId) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // 1. Get rental agreement
            const rentalResult = await transaction.request()
                .input("AgreementID", sql.Int, agreementId)
                .input("OwnerID", sql.Int, ownerId)
                .query(`
                SELECT
                    AgreementID,
                    PropertyID,
                    OwnerID,
                    RenterID,
                    Status
                FROM RentalAgreements
                WHERE AgreementID = @AgreementID
                  AND OwnerID = @OwnerID
            `);

            if (rentalResult.recordset.length === 0) {
                await transaction.rollback();
                return {error: "RENTAL_NOT_FOUND"};
            }

            const rental = rentalResult.recordset[0];

            // 2. Rental must be Pending
            if (rental.Status !== "Pending") {
                await transaction.rollback();
                return {error: "RENTAL_NOT_PENDING"};
            }

            // 3. Check property
            const propertyResult = await transaction.request()
                .input("PropertyID", sql.Int, rental.PropertyID)
                .query(`
                SELECT PropertyID, Status
                FROM Properties
                WHERE PropertyID = @PropertyID
            `);

            if (propertyResult.recordset.length === 0) {
                await transaction.rollback();
                return {error: "PROPERTY_NOT_FOUND"};
            }

            const property = propertyResult.recordset[0];

            // 4. Property must still be available
            if (property.Status !== "available") {
                await transaction.rollback();
                return {error: "PROPERTY_NOT_AVAILABLE"};
            }

            // 5. Activate rental agreement
            await transaction.request()
                .input("AgreementID", sql.Int, agreementId)
                .query(`
                UPDATE RentalAgreements
                SET Status = 'Active'
                WHERE AgreementID = @AgreementID
            `);

            // 6. Mark property as rented
            await transaction.request()
                .input("PropertyID", sql.Int, rental.PropertyID)
                .query(`
                UPDATE Properties
                SET Status = 'rented'
                WHERE PropertyID = @PropertyID
            `);

            // 7. Commit both changes
            await transaction.commit();

            return {
                error: null,
                agreementId: rental.AgreementID,
                propertyId: rental.PropertyID
            };

        } catch (error) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
            throw error;
        }
    }
}

module.exports = RentalAgreementModel;