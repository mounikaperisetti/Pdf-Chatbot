# Total Setup Guide - PDF Chatbot on Windows

The project has two parts:

```text
client  - React frontend
server  - Node/Express backend
```

The frontend is the browser side. The backend is where login, PDF upload, database work, and Gemini API calls happen.

---

## 1. What the Project Does

This is a PDF chatbot web app. A user can register, log in, upload PDF files, select one or more PDFs in the chat screen, and ask questions about them.

The answer is generated using the Gemini API. If the user asks something that is not directly written in the PDF, the bot can mention that clearly and then give a general answer based on the topic.

Example:

```text
These examples are not directly mentioned in the PDF, but based on the topic, here are some real-time examples:
```

The project can be used for resumes, job descriptions, notes, reports, manuals, research papers, or any normal text-based PDF.

---

## 2. Main Tools Used

Frontend side:

- React.js is used for the UI.
- Vite is used to run the frontend during development.
- React Router is used for page navigation.
- Axios is used for API calls.
- Tailwind CSS is used for styling.
- React Icons is used for icons in the UI.

Backend side:

- Node.js runs the backend.
- Express.js creates the REST APIs.
- MySQL stores users, PDFs, extracted PDF text, and chats.
- JWT is used for login authentication.
- bcrypt hashes user passwords.
- multer receives uploaded PDF files.
- pdf-parse extracts text from PDFs.
- Gemini API is used for chatbot answers.
- dotenv keeps private values like database password and API key outside the code.

---

## 3. Project Folder Structure

```text
pdf-chatbot/
  client/
  server/
  package.json
  package-lock.json
  README.md
  Total_Setup_Guide_Windows.md
```

The root `package.json` is useful because it has commands to install and run both frontend and backend together.

---

## 4. Frontend Folder

Frontend path:

```text
pdf-chatbot/client
```

Important files and folders:

```text
client/src/main.jsx       Starts the React app
client/src/App.jsx        Handles frontend routes
client/src/pages          Main screens of the app
client/src/components     Reusable UI parts
client/src/context        Login/user state
client/src/hooks          Custom hooks
client/src/services       Axios API calls
client/src/index.css      Global styling
client/package.json       Frontend packages and commands
```

Main frontend screens:

- Login
- Register
- Dashboard
- Upload PDF
- Chat Room
- History & Files
- Settings

The frontend does not directly talk to MySQL or Gemini. It only calls backend REST APIs.

---

## 5. Backend Folder

Backend path:

```text
pdf-chatbot/server
```

Important files and folders:

```text
server/server.js              Starts Express server
server/config/db.js           MySQL connection
server/routes                 API route files
server/controllers            Main route logic
server/middleware             Auth and upload middleware
server/services/dbService.js  Database query functions
server/services/aiService.js  Gemini API call
server/services/searchService.js  PDF search fallback
server/uploads                Uploaded PDF files
server/.env                   Private settings
server/package.json           Backend packages and commands
```

The backend is the main working part of the application. It checks login, protects private routes, stores PDFs, extracts text, talks to Gemini, and sends the answer back to the frontend.

---

## 6. API Routes

The backend runs on:

```text
http://localhost:5000
```

Authentication routes:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/change-password
```

PDF routes:

```text
POST   /api/pdf/upload
GET    /api/pdf/list
DELETE /api/pdf/:id
```

Chat routes:

```text
POST   /api/chat
GET    /api/chat/history
DELETE /api/chat/history
```

These are REST APIs. The React app calls them using Axios.

---

## 7. How the App Works

Register flow:

```text
User enters details
Frontend sends details to backend
Backend checks email
Password is hashed with bcrypt
User is saved in MySQL
```

Login flow:

```text
User enters email and password
Backend checks the user
Backend compares password
JWT token is created
Frontend stores the token
Private pages become accessible
```

PDF upload flow:

```text
User uploads PDF
Frontend sends file to backend
multer saves file in server/uploads
pdf-parse extracts text
PDF details and extracted text are saved in MySQL
```

Chat flow:

```text
User selects PDFs
User asks a question
Backend gets selected PDF text from MySQL
Backend sends PDF text and question to Gemini
Gemini returns answer
Backend saves chat
Frontend shows the answer
```

If Gemini does not work because of API key, internet, or quota issue, the backend has a simple PDF search fallback.

---

## 8. Database

Database name:

```text
pdf_chatbot
```

Tables:

```text
users  - user account details
pdfs   - uploaded PDF details and extracted text
chats  - user and bot messages
```

Run this SQL in MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS pdf_chatbot;
USE pdf_chatbot;

DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS pdfs;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pdfs (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    originalName VARCHAR(255) NOT NULL,
    fileName VARCHAR(255) NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INT NOT NULL,
    extractedText LONGTEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pdfs_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE chats (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    pdfId VARCHAR(255) NULL,
    sender VARCHAR(10) NOT NULL,
    text TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chats_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_chats_pdf
    FOREIGN KEY (pdfId) REFERENCES pdfs(id)
    ON DELETE SET NULL
);
```

After running this, refresh MySQL Workbench and check that `users`, `pdfs`, and `chats` are created.

---

## 9. Software Needed

Install these first:

- Node.js
- MySQL Server
- MySQL Workbench
- VS Code
- Any browser

Node.js download:

```text
https://nodejs.org/en/download
```

MySQL download:

```text
https://dev.mysql.com/downloads/installer/
```

After installing Node.js, check it in PowerShell:

```bash
node -v
npm -v
```

Both commands should show version numbers.

---

## 10. Open the Project

Open this folder in VS Code:

```text
C:\Users\mouni\OneDrive\Documents\FLProjects\Ai Chatbot\pdf-chatbot
```

Or open PowerShell and run:

```powershell
cd "C:\Users\mouni\OneDrive\Documents\FLProjects\Ai Chatbot\pdf-chatbot"
```

Run commands from the `pdf-chatbot` folder. If commands are run from the wrong folder, `npm` may show `Missing script: dev`.

---

## 11. Install Packages

From the main `pdf-chatbot` folder:

```bash
npm.cmd run install:all
```

This installs packages inside both `server` and `client`.

If normal npm is working on the system, this also works:

```bash
npm run install:all
```

On Windows PowerShell, `npm.cmd` is safer because sometimes `npm` is blocked by script policy.

---

## 12. Create the Backend .env File

Create this file:

```text
pdf-chatbot/server/.env
```

Add this:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pdf_chatbot
JWT_SECRET=pdf_chatbot_secret_key_2026_secure
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Change:

```text
DB_PASSWORD      Your MySQL password
GEMINI_API_KEY  Your Google AI Studio key
```

Do not add quotes around the API key.

Correct:

```env
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxx
```

Not needed:

```env
GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxx"
```

The Gemini key is kept in backend only because frontend code is visible in the browser.

---

## 13. Get Gemini API Key

Open:

```text
https://aistudio.google.com
```

Steps:

1. Sign in with Google.
2. Click `Get API key`.
3. Create a new key.
4. Copy it.
5. Paste it in `server/.env`.

After changing `.env`, restart the backend.

---

## 14. Run the Project

From the main `pdf-chatbot` folder:

```bash
npm.cmd run dev
```

This starts both backend and frontend.

Backend:

```text
http://localhost:5000
```

Frontend:

```text
http://localhost:5173
```

Open this in browser:

```text
http://localhost:5173
```

---

## 15. Run Separately if Needed

Backend only:

```bash
npm.cmd run dev --prefix server
```

Frontend only:

```bash
npm.cmd run dev --prefix client
```

This is useful when checking backend errors separately.

---

## 16. How to Test the App

Use this simple order:

1. Open `http://localhost:5173`.
2. Register a user.
3. Login.
4. Upload one PDF.
5. Go to Chat Room.
6. Select that PDF.
7. Ask: `Summarize this document.`
8. Upload another PDF.
9. Select multiple PDFs.
10. Ask: `Compare these PDFs.`
11. Ask: `Can you give real-time examples?`
12. Check History & Files.
13. Logout.

---

## 17. Demo Questions

```text
Summarize this document.
```

```text
What are the key points in this PDF?
```

```text
What is this document about?
```

```text
Compare these selected PDFs.
```

```text
Can you give real-time examples?
```

---

## 18. Common Errors

`Missing script: dev`

This usually means the command is running from the wrong folder. Go to the `pdf-chatbot` folder and run again.

`npm.ps1 cannot be loaded`

Use:

```bash
npm.cmd run dev
```

`Access denied for user root`

The MySQL password in `server/.env` is wrong. Update `DB_PASSWORD`.

`ECONNREFUSED 3306`

MySQL is not running. Start MySQL service and run the app again.

`Unknown database pdf_chatbot`

The database was not created. Run the SQL given in this guide.

`GEMINI_API_KEY missing`

Add the key in `server/.env` and restart the backend.

Chatbot gives weak answer

Check backend terminal. Gemini may have failed and fallback search may be answering instead.

PDF text not detected

The PDF may be scanned/image-only. This project works best with text-based PDFs.

---

## 19. Stop the Project

In the running terminal:

```text
Ctrl + C
```

If it asks:

```text
Terminate batch job (Y/N)?
```

Type:

```text
Y
```

---

## 20. Start Later

No need to install again.

```powershell
cd "C:\Users\mouni\OneDrive\Documents\FLProjects\Ai Chatbot\pdf-chatbot"
npm.cmd run dev
```

Then open:

```text
http://localhost:5173
```

---

## 21. Build Frontend

To check production build:

```bash
npm.cmd run build --prefix client
```

Build output will be created in:

```text
client/dist
```

---

## 22. Quick Command List

Install all packages:

```bash
npm.cmd run install:all
```

Run full project:

```bash
npm.cmd run dev
```

Run backend:

```bash
npm.cmd run dev --prefix server
```

Run frontend:

```bash
npm.cmd run dev --prefix client
```

Build frontend:

```bash
npm.cmd run build --prefix client
```

---

## 23. Notes for Handover

- MySQL should be running before starting the backend.
- The `.env` file is required for backend.
- Gemini API key should never be placed in frontend files.
- Uploaded PDFs are saved in `server/uploads`.
- Extracted PDF text is saved in MySQL.
- Chat history is saved user-wise.
- JWT token is used so one user cannot access another user's private data.
- Restart the app after changing `.env`.
- Text PDFs work better than scanned PDFs.

---

## 24. Short Final Summary

Frontend:

```text
React + Vite + Tailwind CSS
```

Backend:

```text
Node.js + Express.js + MySQL + JWT
```

AI:

```text
Gemini API
```

Main purpose:

```text
The user uploads PDFs and chats with an AI assistant using the content of those PDFs.
```
