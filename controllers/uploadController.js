const uploadToCloudinary = require("../utils/cloudinaryUpload");

exports.testUpload = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
            publicId: result.public_id
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Image upload failed",
            error: error.message
        });
    }
};