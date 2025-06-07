const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classification_id
  const data = await invModel.getInventoryByClassificationId(classification_id);
  console.log("Fetched inventory:", data);

  if (!data || data.length === 0) {
    const nav = await utilities.getNav()
    req.flash("notice", "No vehicles found for that classification.")
    return res.status(404).render("inventory/classification", {
      title: "No Vehicles Found",
      nav,
      grid: "<p>No vehicles found in this classification.</p>",
      notice: req.flash("notice")
    })
  }

  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    notice: req.flash("notice")
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
      grid: "<p>Vehicle details not available.</p>",
      notice: req.flash("notice")
    })
  }

  const grid = await utilities.buildModelGrid(data)
  const { inv_make, inv_model, inv_year } = data[0]
  res.render("inventory/detail", {
    title: `${inv_make} ${inv_model} ${inv_year}`,
    nav,
    grid,
    notice: req.flash("notice")
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
  const { classification_name } = req.body
  let nav = await utilities.getNav()
  const addClassResult = await invModel.addClassification(classification_name)
  

  if (addClassResult) {
    req.flash("notice", `Your new classification "${classification_name}" was added`)
  } else {
    req.flash("notice", "Sorry, adding classification failed.")
  }
 
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    messages: {
    notice: req.flash("notice")
  }
  })
}

invCont.buildAddVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
    notice: req.flash('notice') || []
  })
}

invCont.addVehicle = async function (req, res) {
 const {
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price,
  inv_miles, inv_color, classification_id
} = req.body;



const addVehicleResult = await invModel.addVehicle(
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price,
  inv_miles, inv_color, parseInt(classification_id) 
);

  if (addVehicleResult) {
    req.flash("notice", `You've added ${inv_make} ${inv_model} ${inv_year} to inventory.`)
  } else {
    req.flash("notice", "Sorry, adding vehicle failed.")
  }

  res.redirect("/inv/add-vehicle")
}

invCont.buildInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationSelect = await utilities.buildClassificationList(); 

  res.render("inventory/inv", {
    title: "Inventory Menu",
    nav,
    errors: null,
    notice: req.flash("notice"),
    classificationSelect  
  });
}
/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  
  const itemDataArray = await invModel.getInventoryByInventoryId(inv_id)  
  
  const itemData = itemDataArray[0] 

  if (!itemData) {
  req.flash("notice", "Vehicle not found.")
  return res.redirect("/inv")
}
  let nav = await utilities.getNav()
  let classificationSelect = await utilities.buildClassificationList(); 
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationSelect, 
    errors:[],
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
    notice: req.flash("notice") 
  })
}

invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const {
     inv_id,
  inv_make,
  inv_model,
  inv_description, 
  inv_image,        
  inv_thumbnail,    
  inv_price,        
  inv_year,        
  inv_miles,    
  inv_color,     
  classification_id 
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
  inv_make,
  inv_model,
  inv_description,  
  inv_image,        
  inv_thumbnail,    
  inv_price,        
  inv_year,         
  inv_miles,       
  inv_color,      
  classification_id 
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationSelect, 
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    notice: [], 
    })
  }
}
module.exports = invCont
