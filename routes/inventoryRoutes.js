// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const inventoryValidation = require('../utilities/inventory-validation')
const accountController = require("../controllers/accountController")

// Route to build inventory by classification view
router.get("/type/:classification_id", invController.buildByClassificationId)
router.get("/detail/:modelId", invController.buildByModelID)
router.get("/add-vehicle", utilities.handleErrors(invController.buildAddVehicle))

router.get("/getInventory/:classification_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.getInventoryJSON))
router.get("/edit/:inv_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.editInventoryView))
router.get("/delete/:inv_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.deleteInventoryView))
router.get("/", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildInventory))
router.get("/add-classification", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildAddClass))
router.post(
  "/add-classification",
  inventoryValidation.classificationRules(),
  inventoryValidation.checkClassData,      
  utilities.handleErrors(invController.addClassification) 
);
router.post(
  "/add-vehicle",
  inventoryValidation.vehicleRules(),
  inventoryValidation.checkVehicleData,
  utilities.handleErrors(invController.addVehicle)
)

router.post("/update/", utilities.handleErrors(invController.updateInventory))
router.post("/delete/:inv_id", utilities.handleErrors(invController.deleteInventory))

module.exports = router;