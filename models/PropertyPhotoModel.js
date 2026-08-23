const {sql, poolPromise} = require("../config/db_config");

class PropertyPhotoModel {

    static async create({
                            propertyId,
                            photoUrl,
                            isPrimary
                        }) {

        const pool = await poolPromise;

        const result = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .input("PhotoURL", sql.NVarChar(500), photoUrl)
            .input("IsPrimary", sql.Bit, isPrimary)
            .query(`
                INSERT INTO PropertyPhotos
                (PropertyID,
                 PhotoURL,
                 IsPrimary)
                    OUTPUT INSERTED.PhotoID,
                    INSERTED.PropertyID,
                    INSERTED.PhotoURL,
                    INSERTED.IsPrimary,
                    INSERTED.CreatedAt
                VALUES
                    (
                    @PropertyID, @PhotoURL, @IsPrimary
                    )
            `);

        return result.recordset[0];
    }
}

module.exports = PropertyPhotoModel;