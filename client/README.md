# DocuMind AI - Frontend

This folder contains the React frontend of the PDF Chatbot project.

The frontend is responsible for everything the user sees and uses in the browser.
It connects with the backend REST APIs to register users, log in, upload PDFs,
select documents, and chat with the assistant.

## What Is Used Here

| Technology | Where It Is Used | Why It Is Used |
| --- | --- | --- |
| React.js | Main frontend UI | To build reusable pages and components |
| Vite | Development server | To run the React app quickly during development |
| React Router | Page navigation | To move between login, register, dashboard, chat, upload, history, and settings pages |
| Axios | API calls | To send requests from frontend to backend |
| Tailwind CSS | Styling | To create a clean and responsive UI |
| React Icons | Icons | To show simple icons in sidebar, buttons, and document actions |

## Main Frontend Pages

- Login page
- Registration page
- Dashboard page
- PDF upload page
- Chat room page
- History and files page
- Settings page

## Important Work Done By Frontend

- Shows login and registration forms.
- Stores the JWT token after successful login.
- Protects pages that should be visible only after login.
- Sends PDF files to the backend using upload APIs.
- Shows uploaded PDFs and allows selecting one or more PDFs for chat.
- Sends chat questions to the backend.
- Shows document-based and general AI answers in the chat screen.
- Allows users to clear chat and manage selected documents.

## How To Run Only Frontend

First install dependencies:

```bash
npm install
```

Then start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Backend Connection

The frontend sends API requests to the backend server.
The backend should be running before testing login, upload, and chat features.

Backend URL:

```text
http://localhost:5000
```

## Note

For full project setup from zero, use this main guide:

```text
../Total_Setup_Guide_Windows.md
```
