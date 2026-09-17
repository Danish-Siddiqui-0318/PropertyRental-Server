USE [PropertyRentalDB];
GO

/* =========================================================
   SEED DATA
   Safe dummy data for local development/testing only.
   PasswordHash values are placeholders. If your Node/Express
   login uses bcrypt, replace these with real bcrypt hashes.
   ========================================================= */

/* ---------- USERS ---------- */
INSERT INTO Users (Name, Email, PasswordHash, Role, Phone)
VALUES
('Admin User',  'admin@test.com',  'DUMMY_HASH_ADMIN',  'admin',  '03001234567'),
('Ali Ahmed',   'owner@test.com',  'DUMMY_HASH_OWNER',  'owner',  '03011234567'),
('Sara Khan',   'renter@test.com', 'DUMMY_HASH_RENTER', 'renter', '03021234567');
GO

/* ---------- PROPERTIES ---------- */
/*
   Property columns are based on the current project schema.
   If your Properties table uses different required columns,
   adjust this INSERT to match the generated schema.sql.
*/
INSERT INTO Properties
(
    OwnerID,
    Title,
    Description,
    PropertyType,
    Address,
    City,
    MonthlyRent,
    Status
)
VALUES
(
    (SELECT UserID FROM Users WHERE Email = 'owner@test.com'),
    '2 Bedroom Apartment in Gulshan',
    'A clean 2 bedroom apartment suitable for a small family.',
    'apartment',
    'Block 7, Gulshan-e-Iqbal',
    'Karachi',
    45000,
    'available'
),
(
    (SELECT UserID FROM Users WHERE Email = 'owner@test.com'),
    'Family House in North Nazimabad',
    'Spacious family house with parking and nearby facilities.',
    'house',
    'Block H, North Nazimabad',
    'Karachi',
    75000,
    'available'
);
GO

/* ---------- CHECK RESULTS ---------- */
SELECT UserID, Name, Email, Role, Phone
FROM Users;
GO

SELECT PropertyID, OwnerID, Title, PropertyType, City, MonthlyRent, Status
FROM Properties;
GO
