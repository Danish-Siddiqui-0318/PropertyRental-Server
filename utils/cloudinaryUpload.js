const cloudinary = require('../config/cloudinary');
const streamifier=require("streamifier");
const buffer = require("node:buffer");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
                folder: "property-rental"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result)
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

module.exports = uploadToCloudinary;