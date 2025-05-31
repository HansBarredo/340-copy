// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const inventoryValidation = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:modelId", invController.buildByModelID);
router.get("/", invController.buildInventory);
router.get("/add-classification", invController.buildAddClass);
router.get("/add-vehicle", invController.buildAddVehicle);
router.post('/add-classification',inventoryValidation.classificationRules(), inventoryValidation.checkClassData, utilities.handleErrors(invController.addClassification))
router.post('/add-vehicle', inventoryValidation.vehicleRules(), inventoryValidation.checkVehicleData, utilities.handleErrors(invController.addVehicle))


module.exports = router;