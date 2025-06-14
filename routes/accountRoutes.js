// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const favoriteController = require("../controllers/favoriteController")
const accountValidation = require('../utilities/account-validation');

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/logout", accountController.logout)
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get("/update/:accountId", utilities.checkLogin, accountController.buildUpdateAccount);
router.get(
  "/update-password/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdatePassword)
)
router.get("/favorite", utilities.checkJWTToken, favoriteController.getFavorites);

// router.get("/management", 
//   utilities.checkLogin, 
//   utilities.handleErrors(accountController.buildAccountManagement)
// )
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
router.post('/register', accountValidation.registationRules(), accountValidation.checkRegData, utilities.handleErrors(accountController.registerAccount))
router.post("/update/:accountId", utilities.checkLogin, accountController.updateAccount);
router.post(
  "/login",
  accountValidation.loginRules(),
  accountValidation.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);
router.post(
    "/update-password/:accountId",
    accountValidation.passwordValidation(),
    utilities.handleErrors(accountController.updatePassword)
);

module.exports = router 