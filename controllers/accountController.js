const bcrypt = require("bcryptjs");
const accountModel = require("../models/account-model");
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require("express-validator");

const accountController = {};

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    notice: req.flash("notice"),
  });
};

/* ****************************************
 *  Deliver registration view
 * *************************************** */
accountController.buildRegister = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    notice: req.flash("notice"),
  });
};

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword);

    if (regResult.rowCount > 0) {
      req.flash("notice", `Congratulations, ${account_firstname}! You are registered. Please log in.`);
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Registration failed. Please try again.");
      return res.redirect("/account/register");
    }
  } catch (error) {
    console.error("Registration Error:", error);
    req.flash("notice", "An error occurred during registration. Please try again.");
    return res.redirect("/account/register");
  }
};

/* ****************************************
 *  Process login request
 * *************************************** */
accountController.accountLogin = async function (req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Invalid email or password. Please try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      notice: req.flash("notice"),
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

      res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== "development", maxAge: 3600 * 1000 });
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Invalid email or password. Please try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        notice: req.flash("notice"),
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    req.flash("notice", "An unexpected error occurred. Please try again.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Build Account Management View
 * *************************************** */
accountController.buildAccountManagement = async function (req, res) {
  const nav = await utilities.getNav();
  const notice = req.flash("notice");
  res.render("account/management", {
    title: "Account Management",
    nav,
    notice,
    errors: null,
  });
};

/* ****************************************
 *  Logout
 * *************************************** */
accountController.logout = async function (req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out successfully.");
  res.redirect("/account/login");
};

/* ****************************************
 *  Update Account
 * *************************************** */
accountController.buildUpdateAccount = async function (req, res) {
  const account_id = req.params.accountId;
  const accountData = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();
  res.render("account/update", {
    title: "Update Account",
    accountData,
    errors: null,
    nav,
    notice: req.flash("notice"),
  });
};

// accountController.viewFavorites = async (req, res) => {
//   try {

//     res.render("account/favorites", {
//       title: "My Favorites",
//       accountData: req.session.accountData || {},
//     });
//   } catch (err) {
//     console.error("Error loading favorites:", err);
//     res.status(500).render("error", { message: "Server error loading favorites." });
//   }
// };


accountController.updateAccount = async function (req, res) {
  const accountId = req.params.accountId;
  const { account_firstname, account_lastname, account_email, account_type } = req.body;

  try {
    const updateResult = await accountModel.updateAccount(accountId, account_firstname, account_lastname, account_email, account_type);
    if (updateResult) {
      req.flash("notice", "Account updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("notice", "Account update failed.");
      return res.redirect(`/account/update/${accountId}`);
    }
  } catch (error) {
    console.error("Account Update Error:", error);
    req.flash("notice", "An error occurred while updating your account. Please try again.");
    return res.redirect(`/account/update/${accountId}`);
  }
};

/* ****************************************
 *  Update Password
 * *************************************** */
accountController.buildUpdatePassword = async function (req, res) {
  const account_id = req.params.accountId;
  const accountData = await accountModel.getAccountById(account_id);
  const nav = await utilities.getNav();
  res.render("account/update-password", {
    title: "New Password",
    accountData,
    nav,
    errors: null,
    notice: req.flash("notice"),
  });
};

accountController.updatePassword = async function (req, res) {
    const nav = await utilities.getNav();
    const accountId = req.params.accountId;  // Use param instead of body
    const { account_password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("notice", "Password does not meet requirements.");
        const accountData = await accountModel.getAccountById(accountId);
        return res.status(400).render("account/update-password", {
            title: "Change Password",
            nav,
            accountData,
            errors: errors.array(),
            notice: req.flash("notice"),
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(account_password, 10);
        const result = await accountModel.updatePassword(accountId, hashedPassword);

        if (result) {
            req.flash("notice", "Password updated successfully.");
            return res.redirect("/account");
        } else {
            req.flash("notice", "Password update failed.");
            return res.redirect(`/account/update-password/${accountId}`);
        }
    } catch (error) {
        console.error("Password Update Error:", error);
        req.flash("notice", "An error occurred. Please try again.");
        return res.redirect(`/account/update-password/${accountId}`);
    }
};

module.exports = accountController;