const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

invCont.buildByModelID = async function (req, res, next) {
    const model_id = req.params.modelId
    const data = await invModel.getInventoryByModelId(model_id)
    const grid = await utilities.buildModelGrid(data)
    let nav = await utilities.getNav()
    const { inv_make, inv_model, inv_year } = data[0];
    res.render("./inventory/detail", {
        title: inv_make + ' ' + inv_model + ' ' + inv_year,
        nav,
        grid,
    })
}

invCont.buildInventory= async function(req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/inv", {
        title: "Inventory Menu",
        nav,
        errors: null
    })
}

invCont.buildAddClass = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null
    })
}

module.exports = invCont