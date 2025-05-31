// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:modelId", invController.buildByModelID);
router.get("/", invController.buildInventory);
router.get("/add-classification", invController.buildAddClass);


module.exports = router;