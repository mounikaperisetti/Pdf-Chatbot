# AI PDF Chatbot 

A full-stack web application where users can upload PDF files and ask questions about them in a chatbot.

Users can upload one PDF or multiple PDFs at the same time. For example, they can upload a resume and a job description, then ask the chatbot to compare them or tailor the resume according to the job description.


---

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT
- **PDF Upload:** Multer
- **PDF Text Extraction:** pdf-parse
- **AI API:** Gemini API

---

## Main Features

- User registration and login
- JWT-based protected routes
- Dashboard for uploaded PDFs and recent chats
- Upload PDFs from Upload page
- Upload PDFs directly inside Chat page
- Select multiple PDFs in chat
- Ask questions based on uploaded PDFs
- AI-powered answers using Gemini API
- General chatbot replies for greetings and simple messages
- Chat history storage
- Password update from Settings page

---

## Simple Project Flow

1. User registers or logs in.
2. Backend verifies the user and sends a JWT token.
3. User uploads PDF files.
4. Backend saves the PDFs and extracts text from them.
5. PDF details and extracted text are stored in MySQL.
6. User selects one or more PDFs in chat.
7. User asks a question.
8. Backend sends the selected PDF text and question to Gemini API.
9. Chatbot returns the best matching answer.
10. Chat messages are saved in history.

---

## Example Use Case

Resume tailoring:

1. Upload resume PDF.
2. Upload job description PDF.
3. Select both PDFs in chat.
4. Ask:

```text
Tailor my resume according to this JD.
```

The chatbot checks both documents and gives a response based on the uploaded content.

---

## Screenshots

### Registration/Login Page
User authentication interface where users can register and securely log in using JWT-based authentication.

<img width="1795" height="957" alt="image" src="https://github.com/user-attachments/assets/7d368781-e129-4403-bd04-2fe988b8e6ac" />



### Dashboard
Dashboard showing uploaded PDF documents, recent activity, and user information.

<img width="1917" height="971" alt="image" src="https://github.com/user-attachments/assets/7cea7b65-5071-447d-b337-d6b2977b2edc" />



### PDF Upload
Users can upload single or multiple PDF documents for AI-powered conversations.

<img width="1886" height="950" alt="image" src="https://github.com/user-attachments/assets/0e6c70eb-6d25-4e83-8c91-dfb275a6d49d" />



### AI Chat Interface
Interactive chatbot interface where users can select PDFs and ask questions based on document content.

<img width="1912" height="976" alt="image" src="https://github.com/user-attachments/assets/dbffad22-a8bc-4925-a3b8-080c95e477a6" />


## Pages

- **Login:** User login
- **Register:** New user signup
- **Dashboard:** Shows uploaded PDFs and recent activity
- **Upload:** Upload and manage PDFs
- **Chat:** Ask questions about one or more PDFs
- **History:** View previous conversations
- **Settings:** View profile and change password

---

## Folder Structure

```text
pdf-chatbot/
|-- client/       React frontend
|-- server/       Node.js + Express backend
|-- README.md
|-- package.json
```

Important folders:

```text
client/src/pages       Frontend pages
client/src/services    API calls
server/routes          Backend API routes
server/controllers     Backend logic
server/services        Database and PDF search logic
server/uploads         Uploaded PDF storage directory (ignored by Git)
```

---

## API Routes

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/change-password
```

### PDFs

```text
POST   /api/pdf/upload
GET    /api/pdf/list
DELETE /api/pdf/:id
```

### Chat

```text
POST   /api/chat
GET    /api/chat/history
DELETE /api/chat/history
```

---

## Database Tables

The project uses three MySQL tables:

- `users` - stores user account details
- `pdfs` - stores uploaded PDF details and extracted text
- `chats` - stores user and chatbot messages

---

## Setup

### 1. Install dependencies

From the main project folder:

```bash
npm run install:all
```

### 2. Create `.env`

Create `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pdf_chatbot
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run the project

```bash
npm.cmd run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

## Demo Steps

1. Register a user.
2. Log in.
3. Upload PDFs.
4. Open Chat.
5. Select one or more PDFs.
6. Ask a question.
7. Check Dashboard and History.

---

---

## Future Enhancements

- Add OCR support for scanned PDF documents
- Implement semantic search using vector embeddings
- Add document summarization feature
- Add chat export functionality
- Deploy application using cloud services
- Improve response accuracy with advanced AI retrieval techniques

## Note

The chatbot answers based on extracted PDF text. If a PDF is scanned as an image and has no readable text, the chatbot may not be able to answer from it.
