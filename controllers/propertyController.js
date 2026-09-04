const PropertyModel = require("../models/PropertyModel");
const PropertyPhotoModel = require("../models/PropertyPhotoModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");
const PropertyInquiryModel = require("../models/PropertyInquiryModel")

exports.createProperty = async (req, res) => {

    try {

        // Only owners can create properties
        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only property owners can create properties"
            });
        }

        const {
            title,
            description,
            propertyType,
            address,
            city,
            bedrooms,
            bathrooms,
            monthlyRent
        } = req.body;

        // Basic validation
        if (
            !title ||
            !description ||
            !propertyType ||
            !address ||
            !city ||
            bedrooms === undefined ||
            bathrooms === undefined ||
            !monthlyRent
        ) {
            return res.status(400).json({
                message: "All property fields are required"
            });
        }

        // Owner ID comes from JWT
        const ownerId = req.user.userId;

        // Create property
        const property = await PropertyModel.create({
            ownerId,
            title,
            description,
            propertyType,
            address,
            city,
            bedrooms,
            bathrooms,
            monthlyRent
        });

        // Upload photos
        const uploadedPhotos = [];

        if (req.files && req.files.length > 0) {

            for (let i = 0; i < req.files.length; i++) {

                const file = req.files[i];

                const result = await uploadToCloudinary(file.buffer);

                const photo = await PropertyPhotoModel.create({
                    propertyId: property.PropertyID,
                    photoUrl: result.secure_url,
                    isPrimary: i === 0
                });

                uploadedPhotos.push(photo);
            }
        }

        res.status(201).json({
            message: "Property created successfully",
            property,
            photos: uploadedPhotos
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.getAllProperties = async (req, res) => {
    try {
        const properties = await PropertyModel.getAllAvailable()
        const propertyMap = new Map();

        for (const row of properties) {
            if (!propertyMap.has(row.PropertyID)) {
                propertyMap.set(row.PropertyID, {
                    PropertyID: row.PropertyID,
                    OwnerID: row.OwnerID,
                    Title: row.Title,
                    Description: row.Description,
                    PropertyType: row.PropertyType,
                    Address: row.Address,
                    City: row.City,
                    Bedrooms: row.Bedrooms,
                    Bathrooms: row.Bathrooms,
                    MonthlyRent: row.MonthlyRent,
                    Status: row.Status,
                    CreatedAt: row.CreatedAt,
                    photos: []
                });
            }
            if (row.PhotoID) {
                propertyMap.get(row.PropertyID).photos.push({
                    PhotoID: row.PhotoID,
                    PhotoURL: row.PhotoURL,
                    IsPrimary: row.IsPrimary
                });
            }
        }
        const result = Array.from(propertyMap.values());

        res.status(200).json({
            message: "Property retrieve successfully",
            count: result.length,
            properties: result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

exports.getPropertyById = async (req, res) => {
    try {
        const propertyId = parseInt(req.params.id);
        if (isNaN(propertyId)) {
            return res.status(400).json({
                message: "Invalid property ID"
            });
        }
        const rows = await PropertyModel.getById(propertyId);
        if (rows.length === 0) {
            return res.status(404).json({
                message: "Property not found"
            })
        }
        const firstRow = rows[0];

        const property = {
            PropertyID: firstRow.PropertyID,
            OwnerID: firstRow.OwnerID,
            Title: firstRow.Title,
            Description: firstRow.Description,
            PropertyType: firstRow.PropertyType,
            Address: firstRow.Address,
            City: firstRow.City,
            Bedrooms: firstRow.Bedrooms,
            Bathrooms: firstRow.Bathrooms,
            MonthlyRent: firstRow.MonthlyRent,
            Status: firstRow.Status,
            CreatedAt: firstRow.CreatedAt,

            owner: {
                UserID: firstRow.OwnerUserID,
                Name: firstRow.OwnerName
            },

            photos: []
        };
        for (const row of rows) {

            if (row.PhotoID) {
                property.photos.push({
                    PhotoID: row.PhotoID,
                    PhotoURL: row.PhotoURL,
                    IsPrimary: row.IsPrimary
                });
            }
        }
        res.status(200).json({
            message: "Property retrieved successfully",
            property
        })
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

exports.updateProperty = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only property owners can update properties"
            })
        }
        const propertyId = parseInt(req.params.id);
        if (isNaN(propertyId)) {
            return res.status(400).json({
                message: "Invalid property ID"
            });
        }
        const {
            title,
            description,
            propertyType,
            address,
            city,
            bedrooms,
            bathrooms,
            monthlyRent
        } = req.body;

        if (
            !title ||
            !description ||
            !propertyType ||
            !address ||
            !city ||
            bedrooms === undefined ||
            bathrooms === undefined ||
            !monthlyRent
        ) {
            return res.status(400).json({
                message: "All property fields are required"
            });
        }
        const updated = await PropertyModel.updateProperty({
            propertyId,
            ownerId: req.user.userId,
            title,
            description,
            propertyType,
            address,
            city,
            bedrooms,
            bathrooms,
            monthlyRent
        });

        if (!updated) {
            return res.status(404).json({
                message: "Property not found or you are not the owner"
            })
        }
        res.status(200).json({
            message: "Property updated successfully"
        })
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

exports.deleteProperty = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({
                message: "Only property owners can delete properties"
            })
        }

        const propertyId = parseInt(req.params.id);

        if (isNaN(propertyId)) {
            return res.status(400).json({
                message: "Invalid property ID"
            })
        }
        const deleted = await PropertyModel.deleteProperty(
            propertyId,
            req.user.userId
        );

        if (!deleted) {
            return res.status(404).json({
                message: "Property not found or you are not the owner"
            });
        }

        res.status(200).json({
            message: "Property deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

exports.addPropertyPhotos = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only property owners can add properties"
            });
        }
        const propertyId = parseInt(req.params.id);

        if (isNaN(propertyId)) {
            return res.status(400).json({
                message: "Invalid property ID"
            })
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "please upload al least one photo"
            })
        }

        const belongsToOwner = await PropertyPhotoModel.propertyBelongsToOwner(propertyId, req.user.userId);

        if (!belongsToOwner) {
            return res.status(404).json({
                message: "Property not found or you are not the owner"
            });
        }

        const uploadedPhotos = [];
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer);
            const photo = await PropertyPhotoModel.create({
                propertyId,
                photoUrl: result.secure_url,
                isPrimary: false
            });
            uploadedPhotos.push(photo);
        }
        res.status(201).json({
            message: "Property photos added successfully",
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.getMyProperties = async (req, res) => {

    try {

        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only property owners can access their properties"
            });
        }

        const rows = await PropertyModel.getMyProperties(
            req.user.userId
        );

        const properties = [];

        for (const row of rows) {

            let property = properties.find(
                p => p.PropertyID === row.PropertyID
            );

            if (!property) {

                property = {
                    PropertyID: row.PropertyID,
                    OwnerID: row.OwnerID,
                    Title: row.Title,
                    Description: row.Description,
                    PropertyType: row.PropertyType,
                    Address: row.Address,
                    City: row.City,
                    Bedrooms: row.Bedrooms,
                    Bathrooms: row.Bathrooms,
                    MonthlyRent: row.MonthlyRent,
                    Status: row.Status,
                    CreatedAt: row.CreatedAt,
                    photos: []
                };

                properties.push(property);
            }

            if (row.PhotoID) {
                property.photos.push({
                    PhotoID: row.PhotoID,
                    PhotoURL: row.PhotoURL,
                    IsPrimary: row.IsPrimary
                });
            }
        }

        res.status(200).json({
            message: "Properties retrieved successfully",
            properties
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.deletePropertyPhoto = async (req, res) => {

    try {

        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only property owners can delete photos"
            });
        }

        const propertyId = parseInt(req.params.id);
        const photoId = parseInt(req.params.photoId);

        if (isNaN(propertyId) || isNaN(photoId)) {
            return res.status(400).json({
                message: "Invalid property ID or photo ID"
            });
        }

        // Find photo and verify ownership
        const photo = await PropertyPhotoModel.findPhotoForOwner(
            photoId,
            propertyId,
            req.user.userId
        );

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found or you are not the owner"
            });
        }

        // Extract Cloudinary public ID from URL
        const url = photo.PhotoURL;

        const uploadIndex = url.indexOf("/upload/");

        if (uploadIndex === -1) {
            return res.status(500).json({
                message: "Invalid Cloudinary URL"
            });
        }

        let publicId = url.substring(uploadIndex + 8);

        // Remove Cloudinary version
        publicId = publicId.replace(/^v\d+\//, "");

        // Remove file extension
        publicId = publicId.replace(/\.[^/.]+$/, "");

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Delete photo record from SQL Server
        const deleted = await PropertyPhotoModel.deletePhoto(
            photoId,
            propertyId,
            req.user.userId
        );

        if (!deleted) {
            return res.status(500).json({
                message: "Photo could not be deleted from database"
            });
        }

        res.status(200).json({
            message: "Property photo deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.createInquiry = async (req, res) => {
    const {message} = req.body;

    try {
        //Only renters can send inquiries
        if (req.user.role !== "renter") {
            return res.status(403).json({
                message: "Only renters can send inquiries"
            })
        }
        //Validate message
        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            })
        }
        const propertyId = parseInt(req.params.id);
        if (isNaN(propertyId)) {
            return res.status(400).json({
                message: "Invalid property ID"
            })
        }
        // Check that property exists
        const property = await PropertyModel.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                message: "Property not found"
            });
        }

        // Create inquiry
        const inquiry = await PropertyInquiryModel.createInquiry(
            propertyId,
            req.user.userId,
            message.trim()
        );
        res.status(201).json({
            message: "Inquiry sent successfully",
            inquiry
        })

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }

}
exports.getOwnerInquiries = async (req, res) => {

    try {

        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only property owners can access inquiries"
            });
        }

        const inquiries = await PropertyInquiryModel.getOwnerInquiries(
            req.user.userId
        );

        res.status(200).json({
            message: "Inquiries retrieved successfully",
            inquiries
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

exports.replyToInquiry = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({
                message: "Only property owners can reply to inquiries"
            });
        }

        const inquiryId = parseInt(req.params.id);
        const { ownerReply } = req.body;

        if (!ownerReply || ownerReply.trim() === "") {
            return res.status(400).json({
                message: "Owner reply is required"
            });
        }

        const inquiry = await PropertyInquiryModel.replyToInquiry(
            inquiryId,
            req.user.userId,
            ownerReply
        );

        if (!inquiry) {
            return res.status(404).json({
                message: "Inquiry not found or you do not own this property"
            });
        }

        res.status(200).json({
            message: "Reply sent successfully",
            inquiry
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
exports.getRenterInquiries = async (req, res) => {
    try {
        if (req.user.role !== "renter") {
            return res.status(403).json({
                message: "Only renters can access their inquiries"
            });
        }

        const inquiries = await PropertyInquiryModel.getRenterInquiries(
            req.user.userId
        );

        res.status(200).json({
            message: "Inquiries retrieved successfully",
            inquiries
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};