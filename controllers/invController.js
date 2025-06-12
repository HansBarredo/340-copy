const invModel = require('../models/inventory-model');
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

invCont.buildByVehicleID = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getInventoryByModelId(inv_id)
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

  const vehicle = data[0]
  const grid = await utilities.buildModelGrid([vehicle])
  const { inv_make, inv_model, inv_year } = vehicle

  res.render("inventory/detail", {
    title: `${inv_make} ${inv_model} ${inv_year}`,
    nav,
    grid,
    notice: req.flash("notice")
  })
}


invCont.buildInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/inv", {
    title: "Inventory Menu",
    nav,
    errors: null,
    notice: req.flash("notice"),
    classificationSelect
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

invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  
  const itemDataArray = await invModel.getInventoryByInventoryId(inv_id)  
  
  const itemData = itemDataArray[0] 

  if (!itemData) {
  req.flash("notice", "Vehicle not found.")
  return res.redirect("/inv")
}
  let nav = await utilities.getNav()
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete", {
    title: "Edit " + itemName,
    nav,
    errors:[],
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    classification_id: itemData.classification_id,
    notice: req.flash("notice") 
  })
}


invCont.deleteInventory = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id);

  if (!inv_id) {
    req.flash("notice", "Invalid inventory ID.");
    return res.redirect("/inv");
  }

  try {
    const deleteResult = await invModel.deleteInventory(inv_id);
    if (deleteResult.rowCount > 0) {
      req.flash("notice", "Inventory item deleted successfully.");
    } else {
      req.flash("notice", "Inventory item not found.");
    }
    res.redirect("/inv");
  } catch (error) {
    console.error("Delete Inventory error:", error);
    req.flash("notice", "Deleting inventory failed. Please try again.");
    res.redirect("/inv");
  }
};

invCont.toggleFavorite = async function (req, res) {
  try {
    const itemId = parseInt(req.params.inv_id); 
    let { is_favorite } = req.body;

    console.log("itemId:", itemId);
    console.log("is_favorite:", is_favorite);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }


    const favoriteStatus = is_favorite === true;

    await invModel.updateFavoriteStatus(itemId, favoriteStatus);

    return res.status(200).json({ message: "Favorite status updated" });
  } catch (err) {
    console.error("Server Error in toggleFavorite:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = invCont
