const pool = require("../database/");

/* ***************************
 *  Check if favorite exists
 * ************************** */
async function checkFavorite(account_id, inv_id) {
  try {
    const sql = "SELECT * FROM favorites WHERE account_id = $1 AND inv_id = $2";
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows;
  } catch (error) {
    console.error("checkFavorite error:", error.message);
    return error.message;
  }
}

/* ***************************
 *  Add to favorites
 * ************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *";
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows;
  } catch (error) {
    console.error("addFavorite error:", error.message);
    return error.message;
  }
}

/* ***************************
 *  Remove from favorites
 * ************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *";
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows;
  } catch (error) {
    console.error("removeFavorite error:", error.message);
    return error.message;
  }
}

module.exports = {
  checkFavorite,
  addFavorite,
  removeFavorite,
};
