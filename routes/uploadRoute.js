const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

router.post(
    "/test",
    upload.single("image"),
    uploadController.testUpload
);

module.exports = router;