const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const utilities = require("../utilities");

// Toggle favorite (add or remove)
router.post("/toggle/:inv_id", utilities.checkJWTToken, favoriteController.toggleFavorite);


// Check if current user has favorited an item
router.get(
  "/favorites/check/:inv_id",
  utilities.checkJWTToken,
  favoriteController.isFavorite
);

module.exports = router;
