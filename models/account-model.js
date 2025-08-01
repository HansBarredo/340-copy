const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = `
            INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) 
            VALUES ($1, $2, $3, $4, 'Client') 
            RETURNING *`;
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    } catch (error) {
        console.log("Inserting:", account_firstname, account_lastname, account_email, account_password);
        return error.message;
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1";
        const email = await pool.query(sql, [account_email]);
        return email.rowCount;
    } catch (error) {
        return error.message;
    }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            `SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password 
             FROM account WHERE account_email = $1`,
            [account_email]
        );
        return result.rows[0];
    } catch (error) {
        return new Error("No matching email found");
    }
}

async function getAccountById(account_id) {
    const data = await pool.query("SELECT * FROM account WHERE account_id = $1", [account_id]);
    return data.rows[0];
}

/* *****************************
 *   Update account with validation
 * *************************** */
async function updateAccount(accountId, firstName, lastName, email, accountType) {
   
    if (!accountType) {
        console.error("Invalid account_type: Empty value received.");
        throw new Error("Invalid account_type: Value cannot be empty.");
    }

    const sql = `
        UPDATE account
        SET account_firstname = $1, 
            account_lastname = $2, 
            account_email = $3, 
            account_type = $4
        WHERE account_id = $5
    `;
    
    console.log("Updating account with:", { accountId, firstName, lastName, email, accountType });

    const result = await pool.query(sql, [
        firstName, 
        lastName, 
        email, 
        accountType || 'Client', 
        accountId    
    ]);

    return result.rowCount;
}

async function updatePassword(account_id, hashedPassword) {
    const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2`;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount;
}

module.exports = { 
    registerAccount, 
    checkExistingEmail, 
    getAccountByEmail, 
    updateAccount, 
    getAccountById,  
    updatePassword 
};