const sql = require("mssql");
const {poolPromise} = require("../config/db_config");

class PropertyInquiryModel {

    static async createInquiry(propertyId, renterId, message) {

        const pool = await poolPromise;

        const result = await pool.request()
            .input("PropertyID", sql.Int, propertyId)
            .input("RenterID", sql.Int, renterId)
            .input("Message", sql.NVarChar(sql.MAX), message)
            .query(`
                INSERT INTO PropertyInquiries
                (PropertyID,
                 RenterID,
                 Message,
                 Status)
                    OUTPUT INSERTED.*
                VALUES
                    (
                    @PropertyID, @RenterID, @Message, 'Pending'
                    )
            `);

        return result.recordset[0];
    }

    static async getOwnerInquiries(ownerId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("OwnerID", sql.Int, ownerId)
            .query(`
                SELECT pi.InquiryID,
                       pi.PropertyID,
                       pi.RenterID,
                       pi.Message,
                       pi.Status,
                       pi.OwnerReply,
                       pi.CreatedAt,
                       pi.RepliedAt,

                       p.Title AS PropertyTitle,

                       u.Name  AS RenterName,
                       u.Email AS RenterEmail,
                       u.Phone AS RenterPhone

                FROM PropertyInquiries pi

                         INNER JOIN Properties p
                                    ON pi.PropertyID = p.PropertyID

                         INNER JOIN Users u
                                    ON pi.RenterID = u.UserID

                WHERE p.OwnerID = @OwnerID

                ORDER BY pi.CreatedAt DESC
            `);

        return result.recordset;
    }

    static async replyToInquiry(inquiryId, ownerId, ownerReply) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("InquiryID", sql.Int, inquiryId)
            .input("OwnerID", sql.Int, ownerId)
            .input("OwnerReply", sql.NVarChar(sql.MAX), ownerReply)
            .query(`
                UPDATE pi
                SET pi.OwnerReply = @OwnerReply,
                    pi.Status     = 'Replied',
                    pi.RepliedAt  = GETDATE() FROM PropertyInquiries pi
            INNER JOIN Properties p
                ON pi.PropertyID = p.PropertyID
                WHERE
                    pi.InquiryID = @InquiryID
                  AND p.OwnerID = @OwnerID;

                SELECT pi.InquiryID,
                       pi.PropertyID,
                       pi.RenterID,
                       pi.Message,
                       pi.Status,
                       pi.OwnerReply,
                       pi.CreatedAt,
                       pi.RepliedAt
                FROM PropertyInquiries pi
                WHERE pi.InquiryID = @InquiryID;
            `);

        return result.recordset[0] || null;
    }

    static async getRenterInquiries(renterId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("RenterID", sql.Int, renterId)
            .query(`
                SELECT pi.InquiryID,
                       pi.PropertyID,
                       pi.RenterID,
                       pi.Message,
                       pi.Status,
                       pi.OwnerReply,
                       pi.CreatedAt,
                       pi.RepliedAt,

                       p.Title  AS PropertyTitle,

                       u.UserID AS OwnerID,
                       u.Name   AS OwnerName,
                       u.Email  AS OwnerEmail,
                       u.Phone  AS OwnerPhone

                FROM PropertyInquiries pi
                         INNER JOIN Properties p
                                    ON pi.PropertyID = p.PropertyID
                         INNER JOIN Users u
                                    ON p.OwnerID = u.UserID

                WHERE pi.RenterID = @RenterID

                ORDER BY pi.CreatedAt DESC
            `);

        return result.recordset;
    }
}

module.exports = PropertyInquiryModel;