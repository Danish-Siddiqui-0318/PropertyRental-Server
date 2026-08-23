const PropertyModel = require("../models/PropertyModel");
const PropertyPhotoModel = require("../models/PropertyPhotoModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

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
