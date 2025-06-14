const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  console.log(data);
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildModelGrid = async function (data, accountId) {
  let grid;

  if (data.length > 0) {
    grid = '<div id="detail-wrapper">'
    data.forEach((vehicle) => {
      grid += `
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${
        vehicle.inv_make
      } ${vehicle.inv_model} on CSE Motors" />
          <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
          <table>
            <tbody>
            
                  <button 
            class="favorite-btn" 
            data-inv-id="${vehicle.inv_id}" 
            data-account-id="${accountId}">
            🤍 Add to Favorite
          </button>
              <tr><th scope="row">Price:</th><td>$${new Intl.NumberFormat(
                "en-US"
              ).format(vehicle.inv_price)}</td></tr>
              <tr><th colspan="2" scope="row">Description:</th></tr>
              <tr><td colspan="2">${vehicle.inv_description}</td></tr>
              <tr><th scope="row">Color:</th><td>${vehicle.inv_color}</td></tr>
              <tr><th scope="row">Miles:</th><td>${vehicle.inv_miles}</td></tr>
            </tbody>
          </table>
      `;
    });
    grid += "</div>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};

Util.buildFavoriteGrid = async function (data, accountId) {
  let grid;

  if (data.length > 0) {
    grid = '<div id="favorite-wrapper">';
    data.forEach((vehicle) => {
      grid += 
          `
      '<div id="detail-wrapper">';
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${
        vehicle.inv_make
      } ${vehicle.inv_model} on CSE Motors" />

      <div class="favorite-card" data-id="<%= vehicle.inv_id %>">
        <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
          <table>
            <tbody>
            
                  <button 
            class="favorite-btn" 
            data-inv-id="${vehicle.inv_id}" 
            data-account-id="${accountId}">
            ❤️ Remove Favorite
          </button>
              <tr><th scope="row">Price:</th><td>$${new Intl.NumberFormat(
                "en-US"
              ).format(vehicle.inv_price)}</td></tr>
              <tr><th colspan="2" scope="row">Description:</th></tr>
              <tr><td colspan="2">${vehicle.inv_description}</td></tr>
              <tr><th scope="row">Color:</th><td>${vehicle.inv_color}</td></tr>
              <tr><th scope="row">Miles:</th><td>${vehicle.inv_miles}</td></tr>
            </tbody>
          </table>
      </div>
      </div>`
      ;
    });
    
    grid += "</div>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};

Util.buildClassificationList = async function (selectedId = null) {
    const data = await invModel.getClassifications();
    
    let classificationList =
        '<select name="classification_id" id="classificationList" required>';
    
    classificationList += "<option value=''>Choose a Classification</option>";

    data.rows.forEach((row) => {
        const isSelected = selectedId != null && row.classification_id == selectedId;
        classificationList += `<option value="${row.classification_id}"${isSelected ? " selected" : ""}>${row.classification_name}</option>`;
    });

    classificationList += "</select>";
    return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
Util.triggerError = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */

// Util.checkJWTToken = (req, res, next) => {
//   const token = req.cookies.jwt // Or from headers: req.headers.authorization?.split(' ')[1]

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: No token provided" })
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET)
//     req.user = decoded // ✅ Attach decoded token to request
//     next()
//   } catch (err) {
//     return res.status(403).json({ message: "Forbidden: Invalid token" })
//   }
// }

Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("error", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }

        // 🔍 DEBUG HERE
        console.log("✅ Decoded JWT accountData:", accountData);

        res.locals.accountData = accountData;
        req.user = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

Util.checkInventoryAccess = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash("notice", "Access denied. Please log in.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const accountType = decoded.account_type;

    if (accountType === "Employee" || accountType === "Admin") {
      req.user = decoded;
      return next();
    } else {
      req.flash(
        "notice",
        "Access restricted. Employee or Admin access required."
      );
      return res.redirect("/account/login");
    }
  } catch (err) {
    req.flash("notice", "Invalid or expired token. Please log in again.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
