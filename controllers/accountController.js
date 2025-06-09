const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { body, validationResult } = require("express-validator")
const accountController = {}

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    notice: req.flash("notice")
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
accountController.buildRegister = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    notice: req.flash("notice")
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (!accountData.account_password) {
  throw new Error("Missing hashed password in database")
}

    if (regResult.rowCount > 0) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.redirect("/account/login")
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      return res.redirect("/account/register")
    }
  } catch (error) {
    console.error("Registration Error:", error)
    req.flash("notice", "An error occurred during registration.")
    return res.redirect("/account/register")
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData ) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      notice: req.flash("notice"),
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Build Account Management View
 * *************************************** */
accountController.buildAccountManagement = async function (req, res) {
  const nav = await utilities.getNav()
  const notice = req.flash("notice")
  res.render("account/management", {
    title: "Account Management",
    nav,
    notice,        
    errors: null
  })
}

accountController.logout = async function (req, res) {
  res.clearCookie("jwt")
  res.clearCookie('sessionId')
  req.flash("notice", "You have been logged out successfully.")
  res.redirect("/account/login")
}


accountController.buildUpdateAccount = async function (req, res, next) {
  const account_id = req.params.accountId;
  const accountData = await accountModel.getAccountById(account_id);
  const notice = req.flash("notice")
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    accountData,
    errors: null,
    nav,
    notice
  });
}
accountController.updateAccount = async function  (req, res, next) {
  const accountId = req.params.accountId;
  const { account_firstname, account_lastname, account_email, account_type } = req.body;

  const updateResult = await accountModel.updateAccount(accountId, account_firstname, account_lastname, account_email, account_type);

  if (updateResult) {
    req.flash("notice", "Account updated successfully.");
    res.redirect("/account");
  } else {
    req.flash("notice", "Account update failed.");
    res.redirect(`/account/update/${accountId}`);
  }
}

accountController.buildUpdatePassword = async function (req, res, next) {
  const account_id = req.params.accountId;
  const accountData = await accountModel.getAccountById(account_id);
  const notice = req.flash("notice")
  let nav = await utilities.getNav()
  res.render("account/update-password", {
    title: "New Password",
    accountData,
    nav,
    errors: null,
    notice
  })
}


accountController.updatePassword = async function (req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  // Validate password
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Password does not meet requirements.")
    const accountData = await accountModel.getAccountById(account_id)
    return res.status(400).render("account/update-password", {
      title: "Change Password",
      nav,
      accountData,
      errors: errors.array(),
      notice: req.flash("notice")
    })
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account")
    } else {
      req.flash("notice", "Password update failed.")
      return res.redirect(`/account/update-password/${account_id}`)
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "An error occurred. Please try again.")
    res.redirect(`/account/update-password/${account_id}`)
  }if (req.method === "POST") {
    console.warn("Unmatched POST request to:", req.originalUrl)
  }
  next()
}

module.exports = accountController
