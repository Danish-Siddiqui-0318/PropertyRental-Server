const express = require('express');
const router = express.Router();

const propertyController = require('../controllers/propertyController');
const jwtMiddleWare = require('../middleware/jwt_token_middleware');
const upload = require("../middleware/uploadMiddleWare")

router.post("/", jwtMiddleWare, upload.array("photos", 10), propertyController.createProperty);
router.get(
    "/",
    propertyController.getAllProperties
);
router.get(
    "/owner/inquiries",
    jwtMiddleWare,
    propertyController.getOwnerInquiries
);
router.put(
    "/inquiries/:id/reply",
    jwtMiddleWare,
    propertyController.replyToInquiry
);
router.get(
    "/my-properties",
    jwtMiddleWare,
    propertyController.getMyProperties
);
router.post(
    "/:id/inquiries",
    jwtMiddleWare,
    propertyController.createInquiry
);
router.get(
    "/:id",
    propertyController.getPropertyById
);

router.put(
    "/:id",
    jwtMiddleWare,
    propertyController.updateProperty
);

router.delete(
    "/:id",
    jwtMiddleWare,
    propertyController.deleteProperty
);
router.post(
    "/:id/photos",
    jwtMiddleWare,
    upload.array("photos", 10),
    propertyController.addPropertyPhotos
);
router.get(
    "/my-properties",
    jwtMiddleWare,
    propertyController.getMyProperties
);
router.delete(
    "/:id/photos/:photoId",
    jwtMiddleWare,
    propertyController.deletePropertyPhoto
);
router.get(
    "/renter/inquiries",
    jwtMiddleWare,
    propertyController.getRenterInquiries
);


module.exports = router;