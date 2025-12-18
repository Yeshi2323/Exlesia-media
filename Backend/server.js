require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- MULTER STORAGE ---------------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

/* ---------------- JWT AUTH ---------------- */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

/* ---------------- ROOT ---------------- */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

/* ---------------- LOGIN ---------------- */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM admins WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);

    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- GET NEWS (PUBLIC) ---------------- */
app.get("/api/news", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM news ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET NEWS ERROR:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

/* ---------------- CREATE NEWS (ADMIN + IMAGE UPLOAD) ---------------- */
app.post(
  "/api/news",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content required" });
      }

      const imageUrl = req.file
        ? `${BASE_URL}/uploads/${req.file.filename}`
        : null;

      console.log("Creating news with:", { title, content, imageUrl });

      const [result] = await pool.query(
        "INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)",
        [title, content, imageUrl]
      );

      console.log("Database result:", result);

      res.json({
        id: result.insertId,
        title,
        content,
        image_url: imageUrl,
        created_at: new Date(),
      });
    } catch (err) {
      console.error("CREATE NEWS ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* ---------------- UPDATE NEWS (ADMIN + OPTIONAL IMAGE) ---------------- */
app.put(
  "/api/news/:id",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content required" });
      }

      let imageUrl = null;
      if (req.file) {
        imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
        await pool.query(
          "UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?",
          [title, content, imageUrl, id]
        );
      } else {
        await pool.query(
          "UPDATE news SET title = ?, content = ? WHERE id = ?",
          [title, content, id]
        );
      }

      res.json({ id, title, content, image_url: imageUrl });
    } catch (err) {
      console.error("UPDATE NEWS ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* ---------------- DELETE NEWS (ADMIN) ---------------- */
app.delete("/api/news/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM news WHERE id = ?", [id]);
    res.json({ id });
  } catch (err) {
    console.error("DELETE NEWS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`✔ Server running on http://localhost:${PORT}`);
});
