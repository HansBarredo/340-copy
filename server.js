/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const accountController = require("./controllers/accountController")
const invController = require("./controllers/invController")
const inventoryRoute = require("./routes/inventoryRoutes")
const accountRoute = require("./routes/accountRoutes") 
const utilities = require("./utilities");
const errorRoute = require("./routes/errorRoutes");
const session = require("express-session");
const pool = require('./database/');
const flash = require("connect-flash")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")





/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(express.static("public"));
// Express Messages Middleware
app.use(flash())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser())
app.use(utilities.checkJWTToken)
/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(express.static("public"))
//Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute) 
// Route to build login view
app.get("/login", utilities.handleErrors(accountController.buildLogin))

app.get("/register", utilities.handleErrors(accountController.buildRegister))


//Error
app.use('/errors', errorRoute)


// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${port}`)
})



/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) {
    message = err.message
  } else {
    message ="Oh no! There was a crash. Maybe try a different route?"
  }
  
  res.status(err.status || 500).render("errors/trigger-error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})