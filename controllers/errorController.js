const utilities = require("../utilities/")
const errorController = {}



errorController.triggerError = async function (req, res, next) {
    try {
        throw new Error("This is a test error for 500 handling.");
    } catch (error) {
        next(error); 
    }
};

module.exports = errorController