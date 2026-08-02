const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Keeps the React dev server and API server able to talk during local development.
app.use(cors());

// Needed for JSON API requests such as login and chat messages.
app.use(express.json());

// Allows form-urlencoded requests from tools like Postman if needed.
app.use(express.urlencoded({ extended: true }));

// Uploaded files stay on disk; this makes them reachable if a preview is needed.
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdf", pdfRoutes);

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
=====================================
 PDF CHATBOT BACKEND SERVER
=====================================
 Server Running: http://localhost:${PORT}
 Status: ACTIVE
 Environment: ${process.env.NODE_ENV || "development"}
 Upload Path: /uploads
 Auth: JWT Enabled
=====================================
  `);
});
