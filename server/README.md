# DocuMind AI - Backend

This folder contains the Node.js and Express.js backend of the PDF Chatbot project.

The backend handles user authentication, PDF upload, PDF text extraction, MySQL database work,
chat history, and Gemini API communication for AI answers.

## What Is Used Here

| Technology | Where It Is Used | Why It Is Used |
| --- | --- | --- |
| Node.js | Backend runtime | To run server-side JavaScript |
| Express.js | API server | To create REST APIs for auth, PDF upload, and chat |
| MySQL | Database | To store users, uploaded PDF details, extracted text, and chat messages |
| JWT | Authentication | To protect private routes after login |
| bcrypt | Password security | To store passwords in hashed format |
| multer | PDF upload | To receive PDF files from the frontend |
| pdf-parse | PDF reading | To extract text from uploaded PDF files |
| Gemini API | AI response | To generate document-based and general answers |
| dotenv | Environment variables | To keep database details, JWT secret, and API keys outside code |
| cors | Frontend access | To allow the React frontend to call backend APIs |
| helmet | Basic security | To add safer HTTP headers |

## Main Backend Folders

```text
server/
  config/        Database connection
  controllers/   Main request handling logic
  middleware/    JWT authentication and upload middleware
  routes/        REST API route files
  services/      Database, AI, and PDF search helper logic
  uploads/       Uploaded PDF files
  server.js      Backend app starting point
```

## Main Backend Features

- User registration
- User login
- JWT token generation
- Protected API routes
- PDF upload
- PDF text extraction
- PDF metadata storage in MySQL
- Chat question processing
- Gemini API response generation
- Chat history saving
- User-specific data handling

## REST API Groups

| API Group | Purpose |
| --- | --- |
| `/api/auth` | Register, login, and user authentication |
| `/api/pdf` | Upload PDFs and fetch uploaded files |
| `/api/chat` | Send questions and get chatbot answers |

## Environment File

Create a `.env` file inside the `server` folder.

Example:

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

## How To Run Only Backend

First install dependencies:

```bash
npm install
```

Then start the backend:

```bash
npm run dev
```

The backend normally runs at:

```text
http://localhost:5000
```

## Before Running Backend

Make sure these are ready:

- MySQL server is running.
- Database tables are created.
- `.env` file has correct database details.
- `GEMINI_API_KEY` is added in `.env`.

## Note

For full project setup from zero, use this main guide:

```text
../Total_Setup_Guide_Windows.md
```
