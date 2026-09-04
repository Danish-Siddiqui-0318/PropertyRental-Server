const {sql, poolPromise} = require("../config/db_config");

class PropertyModel {

    static async create({
                            ownerId,
                            title,
                            description,
                            propertyType,
                            address,
                            city,
                            bedrooms,
                            bathrooms,
                            monthlyRent
                        }) {

        const pool = await poolPromise;

        const result = await pool.request()
            .input("OwnerID", sql.Int, ownerId)
            .input("Title", sql.NVarChar(150), title)
            .input("Description", sql.NVarChar(sql.MAX), description)
            .input("PropertyType", sql.NVarChar(50), propertyType)
            .input("Address", sql.NVarChar(255), address)
            .input("City", sql.NVarChar(100), city)
            .input("Bedrooms", sql.Int, bedrooms)
            .input("Bathrooms", sql.Int, bathrooms)
            .input("MonthlyRent", sql.Decimal(12, 2), monthlyRent)
            .query(`
                INSERT INTO Properties
                (OwnerID,
                 Title,
                 Description,
                 PropertyType,
                 Address,
                 City,
                 Bedrooms,
                 Bathrooms,
                 MonthlyRent)
                    OUTPUT INSERTED.PropertyID,
                    INSERTED.OwnerID,
                    INSERTED.Title,
                    INSERTED.Description,
                    INSERTED.PropertyType,
                    INSERTED.Address,
                    INSERTED.City,
                    INSERTED.Bedrooms,
                    INSERTED.Bathrooms,
                    INSERTED.MonthlyRent,
                    INSERTED.Status,
                    INSERTED.CreatedAt
                VALUES
                    (
                    @OwnerID, @Title, @Description, @PropertyType, @Address, @City, @Bedrooms, @Bathrooms, @MonthlyRent
                    )
            `);

        return result.recordset[0];
    }

    static async getAllAvailable() {
        const pool = await poolPromise;

        const result = await pool.request()
            .query(`
                SELECT p.PropertyID,
                       p.OwnerID,
                       p.Title,
                       p.Description,
                       p.PropertyType,
                       p.Address,
                       p.City,
                       p.Bedrooms,
                       p.Bathrooms,
                       p.MonthlyRent,
                       p.Status,
                       p.CreatedAt,

                       pp.PhotoID,
                       pp.PhotoURL,
                       pp.IsPrimary

                FROM Properties p

                         LEFT JOIN PropertyPhotos pp
                                   ON p.PropertyID = pp.PropertyID

                WHERE p.Status = 'available'

                ORDER BY p.CreatedAt DESC
            `);

        return result.recordset;
    }

    static async getById(propertyId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .query(`
                SELECT p.PropertyID,
                       p.OwnerID,
                       p.Title,
                       p.Description,
                       p.PropertyType,
                       p.Address,
                       p.City,
                       p.Bedrooms,
                       p.Bathrooms,
                       p.MonthlyRent,
                       p.Status,
                       p.CreatedAt,

                       u.UserID AS OwnerUserID,
                       u.Name   AS OwnerName,

                       pp.PhotoID,
                       pp.PhotoURL,
                       pp.IsPrimary

                FROM Properties p

                         INNER JOIN Users u
                                    ON p.OwnerID = u.UserID

                         LEFT JOIN PropertyPhotos pp
                                   ON p.PropertyID = pp.PropertyID

                WHERE p.PropertyID = @PropertyID
            `);

        return result.recordset;
    }

    static async updateProperty({
                                    propertyId,
                                    ownerId,
                                    title,
                                    description,
                                    propertyType,
                                    address,
                                    city,
                                    bedrooms,
                                    bathrooms,
                                    monthlyRent
                                }) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .input("OwnerID", sql.Int, ownerId)
            .input("Title", sql.NVarChar(150), title)
            .input("Description", sql.NVarChar(sql.MAX), description)
            .input("PropertyType", sql.NVarChar(50), propertyType)
            .input("Address", sql.NVarChar(255), address)
            .input("City", sql.NVarChar(100), city)
            .input("Bedrooms", sql.Int, bedrooms)
            .input("Bathrooms", sql.Int, bathrooms)
            .input("MonthlyRent", sql.Decimal(12, 2), monthlyRent)
            .query(`
                UPDATE Properties
                SET Title        = @Title,
                    Description  = @Description,
                    PropertyType = @PropertyType,
                    Address      = @Address,
                    City         = @City,
                    Bedrooms     = @Bedrooms,
                    Bathrooms    = @Bathrooms,
                    MonthlyRent  = @MonthlyRent
                WHERE PropertyID = @PropertyID
                  AND OwnerID = @OwnerID
            `);

        return result.rowsAffected[0];
    }

    static async deleteProperty(propertyId, ownerId) {
        const pool = await poolPromise;

        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // First check ownership
            const propertyResult = await transaction.request()
                .input("PropertyID", sql.Int, propertyId)
                .input("OwnerID", sql.Int, ownerId)
                .query(`
                    SELECT PropertyID
                    FROM Properties
                    WHERE PropertyID = @PropertyID
                      AND OwnerID = @OwnerID
                `);

            if (propertyResult.recordset.length === 0) {
                await transaction.rollback();
                return 0;
            }

            // Delete related photos
            await transaction.request()
                .input("PropertyID", sql.Int, propertyId)
                .query(`
                    DELETE
                    FROM PropertyPhotos
                    WHERE PropertyID = @PropertyID
                `);

            // Delete property
            const result = await transaction.request()
                .input("PropertyID", sql.Int, propertyId)
                .input("OwnerID", sql.Int, ownerId)
                .query(`
                    DELETE
                    FROM Properties
                    WHERE PropertyID = @PropertyID
                      AND OwnerID = @OwnerID
                `);

            await transaction.commit();

            return result.rowsAffected[0];

        } catch (error) {

            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }

            throw error;
        }
    }

    static async getMyProperties(ownerId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("OwnerID", sql.Int, ownerId)
            .query(`
                SELECT p.PropertyID,
                       p.OwnerID,
                       p.Title,
                       p.Description,
                       p.PropertyType,
                       p.Address,
                       p.City,
                       p.Bedrooms,
                       p.Bathrooms,
                       p.MonthlyRent,
                       p.Status,
                       p.CreatedAt,

                       pp.PhotoID,
                       pp.PhotoURL,
                       pp.IsPrimary

                FROM Properties p

                         LEFT JOIN PropertyPhotos pp
                                   ON p.PropertyID = pp.PropertyID

                WHERE p.OwnerID = @OwnerID

                ORDER BY p.CreatedAt DESC
            `);

        return result.recordset;
    }

    static async findById(propertyId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .query(`
                SELECT *
                FROM Properties
                WHERE PropertyID = @PropertyID
            `);

        return result.recordset[0] || null;
    }
}

module.exports = PropertyModel;