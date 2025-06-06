const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data)
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }

Util.buildModelGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<div id="detail-wrapper">'
        data.forEach(vehicle => {
            grid += '<img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" />'
            grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details</h2>'
            grid += '<table>'
            grid += '<tbody>'
            grid += '<tr>'
            grid += '<th scope=row>Price:</th>'
            grid += '<td>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</td>'
            grid += '</tr>'
            grid += '<tr>'
            grid += '<th colspan="2" scope=row>Description:</th>'
            grid += '</tr>'
            grid += '<tr>'
            grid += '<td colspan="2">' + vehicle.inv_description + '</td>'
            grid += '</tr>'
            grid += '<tr>'
            grid += '<th scope=row>Color:</th>'
            grid += '<td>' + vehicle.inv_color + '</td>'
            grid += '</tr>'
            grid += '<tr>'
            grid += '<th scope=row>Miles:</th>'
            grid += '<td>' + vehicle.inv_miles + '</td>'
            grid += '</tr>'
            grid += '</tbody>'
            grid += '</table>'
        })
        grid += '</div>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

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
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
Util.triggerError = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 

module.exports = Util




