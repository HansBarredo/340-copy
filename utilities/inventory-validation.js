const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const inventorytModel = require("../models/inventory-model")

// Classification rules
validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .notEmpty()
            .withMessage("Classification name is required.")
            .isLength({ min: 2 })
            .withMessage("Classification name must be at least 2 characters long.")
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage("Classification name must contain only letters and spaces.")
            .custom(async (classification_name) => {
                const classExists = await inventorytModel.checkExistingClass(classification_name)
                if (classExists) {
                    throw new Error("Classification exists. Please log in or use a different classification")
                }
            }),
    ]
}

/* ******************************
 * Check data and return errors or continue to classification addition
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  let errors = validationResult(req);

  const classification_name = req.body?.classification_name || "";

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors: errors.array(),
      title: "New Classification",
      nav,
      classification_name,
    });
    return;
  }

  next();
};


validate.vehicleRules = () => {
    return [
        body('inv_make')
            .notEmpty().withMessage('Vehicle make is required')
            .trim()
            .escape(),

        body('inv_model')
            .notEmpty().withMessage('Vehicle model is required')
            .trim()
            .escape(),

        body('inv_year')
            .notEmpty().withMessage('Vehicle year is required')
            .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
            .withMessage('Enter a valid vehicle year')
            .custom(async (value, { req }) => {
                const { inv_make, inv_model } = req.body
                const existing = await inventorytModel.checkExistingVehicle(inv_make, inv_model, value)
                if (existing.rowCount > 0) {
                    throw new Error('This vehicle already exists')
                }
                return true
            }),

        body('inv_description')
            .notEmpty().withMessage('Description is required')
            .trim(),

        body('inv_image')
            .notEmpty().withMessage('Image path is required')
            .trim(),

        body('inv_thumbnail')
            .notEmpty().withMessage('Thumbnail path is required')
            .trim(),

        body('inv_price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

        body('inv_miles')
            .notEmpty().withMessage('Mileage is required')
            .isInt({ min: 0 }).withMessage('Mileage must be a non-negative integer'),

        body('inv_color')
            .notEmpty().withMessage('Color is required')
            .trim()
            .escape(),

        body('classification_id')
            .notEmpty().withMessage('Classification is required')
            .isInt({ min: 1 }).withMessage('Invalid classification ID'),
    ]
}

/* ******************************
 * Check data and return errors or continue to vehicle addition
 * ***************************** */

validate.checkVehicleData = async (req, res, next) => {
  let errors = validationResult(req)
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  const {
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_miles,
  inv_color, classification_id
} = req.body;
  if (!errors.isEmpty()) {
    res.render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      notice: req.flash("notice"),
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
    })
    return
  }
  next()
}


module.exports = validate
