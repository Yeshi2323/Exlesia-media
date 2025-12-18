require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcrypt");
const pool = require("./db");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Admin username: ", (username) => {
  rl.question("Admin password: ", async (password) => {
    try {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT IGNORE INTO admins (username, password_hash) VALUES (?, ?)",
        [username, hash]
      );
      console.log("✅ Admin created");
    } catch (err) {
      console.error("Error creating admin:", err);
    } finally {
      rl.close();
      process.exit(); // ✅ exits after creating admin
    }
  });
});
