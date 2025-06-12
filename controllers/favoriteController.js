const favoriteModel = require("../models/favorite-model");
/* ***************************
 *  Toggle favorite for current user
 * ************************** */
async function toggleFavorite(req, res) {
  const account_id = req.user.account_id; // 👈 Use value from JWT
  const inv_id = req.params.inv_id;

  try {
    const exists = await favoriteModel.checkFavorite(account_id, inv_id);
    if (exists.length > 0) {
      const removed = await favoriteModel.removeFavorite(account_id, inv_id);
      return res.json({ status: "removed", favorite: removed });
    } else {
      const added = await favoriteModel.addFavorite(account_id, inv_id);
      return res.json({ status: "added", favorite: added });
    }
  } catch (error) {
    console.error("toggleFavorite error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}

/* ***************************
 *  Check if current user has favorited the item
 * ************************** */
async function isFavorite(req, res) {
  const inv_id = parseInt(req.params.inv_id);
  const account_id = req.jwt?.account_id;

  try {
    const existing = await favoriteModel.checkFavorite(account_id, inv_id);
    res.json({ success: true, is_favorite: existing.length > 0 });
  } catch (error) {
    console.error("isFavorite error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  toggleFavorite,
  isFavorite
};