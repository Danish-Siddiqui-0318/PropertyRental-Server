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

    static async propertyBelongsToOwner(propertyId, ownerId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .input("OwnerID", sql.Int, ownerId)
            .query(`
                SELECT PropertyID
                FROM Properties
                WHERE PropertyID = @PropertyID
                  AND OwnerID = @OwnerID
            `);

        return result.recordset.length > 0;
    }

    static async deletePhoto(photoId, propertyId, ownerId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PhotoID", sql.Int, photoId)
            .input("PropertyID", sql.Int, propertyId)
            .input("OwnerID", sql.Int, ownerId)
            .query(`
                DELETE
                FROM PropertyPhotos
                WHERE PhotoID = @PhotoID
                  AND PropertyID = @PropertyID
                  AND PropertyID IN (SELECT PropertyID
                                     FROM Properties
                                     WHERE PropertyID = @PropertyID
                                       AND OwnerID = @OwnerID)
            `);

        return result.rowsAffected[0];
    }

    static async findPhotoForOwner(photoId, propertyId, ownerId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("PhotoID", sql.Int, photoId)
            .input("PropertyID", sql.Int, propertyId)
            .input("OwnerID", sql.Int, ownerId)
            .query(`
            SELECT
                pp.PhotoID,
                pp.PropertyID,
                pp.PhotoURL
            FROM PropertyPhotos pp
            INNER JOIN Properties p
                ON pp.PropertyID = p.PropertyID
            WHERE pp.PhotoID = @PhotoID
              AND pp.PropertyID = @PropertyID
              AND p.OwnerID = @OwnerID
        `);

        return result.recordset[0] || null;
    }
}

module.exports = PropertyPhotoModel;