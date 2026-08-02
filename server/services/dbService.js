const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

async function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase()],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });
}

async function findUserById(id) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, fullName, email, createdAt FROM users WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });
}

async function findUserByIdWithPassword(id) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });
}

async function updateUserPassword(id, passwordHash) {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET passwordHash = ? WHERE id = ?",
      [passwordHash, id],
      (err) => {
        if (err) return reject(err);
        resolve(true);
      }
    );
  });
}

async function createUser(fullName, email, passwordHash) {
  const id = uuidv4();

  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (id, fullName, email, passwordHash) VALUES (?, ?, ?, ?)",
      [id, fullName, email.toLowerCase(), passwordHash],
      (err) => {
        if (err) return reject(err);
        resolve({ id, fullName, email });
      }
    );
  });
}

async function createPdf(userId, originalName, fileName, filePath, fileSize, extractedText) {
  const id = uuidv4();

  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO pdfs (id, userId, originalName, fileName, filePath, fileSize, extractedText)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, originalName, fileName, filePath, fileSize, extractedText],
      (err) => {
        if (err) return reject(err);

        resolve({
          id,
          userId,
          originalName,
          fileName,
          filePath,
          fileSize,
          extractedText
        });
      }
    );
  });
}

async function findPdfsByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM pdfs WHERE userId = ? ORDER BY createdAt DESC",
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

async function findPdfsByIds(pdfIds, userId) {
  return new Promise((resolve, reject) => {
    if (!pdfIds || pdfIds.length === 0) return resolve([]);

    // Each selected id gets its own placeholder so the query stays parameterized.
    const placeholders = pdfIds.map(() => "?").join(",");

    db.query(
      `SELECT * FROM pdfs
       WHERE id IN (${placeholders}) AND userId = ?`,
      [...pdfIds, userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

async function findPdfById(id) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM pdfs WHERE id = ?",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });
}

async function deletePdf(id) {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM pdfs WHERE id = ?", [id], (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

async function saveChatMessage(userId, pdfId, sender, text) {
  const id = uuidv4();

  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO chats (id, userId, pdfId, sender, text)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, pdfId, sender, text],
      (err) => {
        if (err) return reject(err);
        resolve({ id, userId, pdfId, sender, text });
      }
    );
  });
}

async function getChatHistory(userId, pdfId = null) {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM chats WHERE userId = ?";
    let params = [userId];

    if (pdfId) {
      query += " AND pdfId = ?";
      params.push(pdfId);
    }

    query += " ORDER BY createdAt ASC";

    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

async function deleteChatHistory(userId, pdfId = null) {
  return new Promise((resolve, reject) => {
    let query = "DELETE FROM chats WHERE userId = ?";
    let params = [userId];

    if (pdfId) {
      query += " AND pdfId = ?";
      params.push(pdfId);
    }

    db.query(query, params, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUserPassword,
  createUser,
  createPdf,
  findPdfsByUserId,
  findPdfsByIds,
  findPdfById,
  deletePdf,
  saveChatMessage,
  getChatHistory,
  deleteChatHistory
};
