const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const utilities = require("../utilities");


router.post("/toggle/:inv_id", utilities.checkJWTToken, favoriteController.toggleFavorite);




router.get(
  "/favorites/check/:inv_id",
  utilities.checkJWTToken,
  favoriteController.isFavorite
);

module.exports = router;
