const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)


  if (!data || data.length === 0) {
    const nav = await utilities.getNav()
    req.flash("notice", "No vehicles found for that classification.")
    return res.status(404).render("inventory/classification", {
      title: "No Vehicles Found",
      nav,
      grid: "<p>No vehicles found in this classification.</p>"
    })
  }

  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


invCont.buildByModelID = async function (req, res, next) {
  const model_id = req.params.modelId
  const data = await invModel.getInventoryByModelId(model_id)
  let nav = await utilities.getNav()

  if (!data || data.length === 0) {
    req.flash("notice", "Vehicle not found.")
    return res.status(404).render("inventory/detail", {
      title: "Vehicle Not Found",
      nav,
      grid: "<p>Vehicle details not available.</p>"
    })
  }

  const grid = await utilities.buildModelGrid(data)
  const { inv_make, inv_model, inv_year } = data[0]
  res.render("inventory/detail", {
    title: `${inv_make} ${inv_model} ${inv_year}`,
    nav,
    grid,
  })
}

invCont.buildInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/inv", {
    title: "Inventory Menu",
    nav,
    errors: null,
    notice: req.flash("notice")
  })
}

invCont.buildAddClass = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    notice: req.flash("notice")
  })
}

invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const addClassResult = await invModel.addClassification(classification_name)

  if (addClassResult) {
    req.flash("notice", `Your new classification ${classification_name} was added`)
    res.status(201).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      notice: req.flash("notice")
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add NewClassification",
      nav,
      errors: null,
      notice: req.flash("notice")
    })
  }
}

invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
    notice: req.flash("notice")
  })
}


invCont.addVehicle = async function (req, res) {
  let nav = await utilities.getNav()
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price,
    inv_miles, inv_color, classification_id
  } = req.body

  const addVehicleResult = await invModel.addVehicle(
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price,
    inv_miles, inv_color, classification_id
  )

  if (addVehicleResult) {
    req.flash("notice", `You've added ${inv_make} ${inv_model} ${inv_year} to inventory.`)
    res.status(201).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      notice: req.flash("notice")
    })
  } else {
    req.flash("notice", "Sorry, adding failed.")
    res.status(501).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      notice: req.flash("notice")
    })
  }
}

module.exports = invCont
