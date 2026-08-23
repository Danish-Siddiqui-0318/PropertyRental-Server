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
}

module.exports = PropertyModel;