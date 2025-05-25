const utilities = require("../utilities/")
const errorController = {}

errorController.triggerError = async function (req, res) {
    const nav = await utilities.getNav()
    try {
        throw new Error("This is a test error for 500 handling.");
    } catch (error) {
        return next(error); 
    }
};

module.exports = errorController