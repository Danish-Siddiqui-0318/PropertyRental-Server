const {sql, poolPromise} = require('../config/db_config');

class UserModel {

    static async findByEmail(email) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('Email', sql.NVarChar(255), email)
            .query(`
                SELECT UserID,
                       Name,
                       Email,
                       PasswordHash,
                       Role,
                       Phone
                FROM Users
                WHERE Email = @Email
            `);

        return result.recordset[0] || null;
    }


    static async create({name, email, hashedPassword, role, phone}) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('Name', sql.NVarChar(100), name)
            .input('Email', sql.NVarChar(255), email)
            .input('PasswordHash', sql.NVarChar(255), hashedPassword)
            .input('Role', sql.NVarChar(20), role)
            .input('Phone', sql.NVarChar(20), phone || null)
            .query(`
                INSERT INTO Users
                    (Name, Email, PasswordHash, Role, Phone)
                    OUTPUT INSERTED.UserID,
                    INSERTED.Name,
                    INSERTED.Email,
                    INSERTED.Role,
                    INSERTED.Phone

                VALUES
                    (@Name, @Email, @PasswordHash, @Role, @Phone)
            `);

        return result.recordset[0];
    }

    static async findById(userId) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query(`SELECT UserID, Name, Email, PasswordHash, Role, Phone, CreatedAt
                    FROM Users
                    WHERE USERID = @UserID`);
        return result.recordset[0] || null;
    }

    static async updateProfile(userId, {name, email, phone}) {

        const pool = await poolPromise;

        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .input('Phone', sql.NVarChar, phone || null)
            .query(`
                UPDATE Users
                SET Name  = @Name,
                    Email = @Email,
                    Phone = @Phone
                WHERE UserID = @UserID
            `);

        return result.rowsAffected[0];
    }

    static async changePassword(userId, hashedPassword) {
        const pool = await poolPromise;

        const result = await pool.request()
            .input("UserID", sql.Int, userId)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .query(`
                UPDATE Users
                SET PasswordHash = @PasswordHash
                WHERE UserID = @UserID
            `);

        return result.rowsAffected[0];
    }
}

module.exports = UserModel;