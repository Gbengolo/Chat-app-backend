# Real-Time Chat App — Backend

A backend MVP for a real-time chat application, built for the TS Academy Backend Development Capstone (Group 19).

## Description

This backend powers a real-time messaging platform where users can register, log in, see who's online, start conversations, exchange messages in real time, and see delivery/read status on their messages.

## Problem Being Solved

Most chat products need a backend that can handle live presence, message delivery, and read receipts reliably — not just store messages, but track *state* (who's online, has a message been seen) in real time. This project demonstrates a working implementation of that core flow, end to end, through a REST + WebSocket API.

## Target Users

- **General users** — register, log in, see who's online, start conversations, send/receive messages, see read receipts.
- **(Optional/future)** Admins — moderate users or conversations.

## MVP Features

- User registration and login (JWT-based authentication)
- Password hashing (bcrypt) — passwords are never stored or returned in plain text
- Real-time online/offline presence tracking via Socket.IO
- Typing indicators, scoped to individual conversations
- Create and list conversations between users
- Send and retrieve messages, with pagination
- Per-recipient message status tracking (sent / delivered / read)
- Consistent API response format across all endpoints
- Protected routes requiring a valid JWT

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time layer:** Socket.IO
- **Database:** MongoDB (via Mongoose)
- **Auth:** JSON Web Tokens (JWT) + bcrypt
- **Validation:** Joi
- **Dev tooling:** nodemon

## Database

MongoDB, hosted on MongoDB Atlas. Core collections:

| Collection | Purpose |
|---|---|
| `users` | Registered accounts — username, email, hashed password, timestamps |
| `conversations` | Groups of participants who share a message thread |
| `messages` | Individual messages, including per-recipient delivery/read status |

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database connection setup
│   ├── controllers/    # Route handler logic
│   ├── middleware/      # Auth protection, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   ├── utils/            # Helpers (JWT signing/verification, custom errors)
│   ├── validations/      # Joi validation schemas
│   └── app.js            # App entry point (Express + Socket.IO server)
├── .env                  # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/Gbengolo/Chat-app-backend.git
   cd Chat-app-backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

## Environment Variables

Create a `.env` file in the root directory with the following (ask a team member for the actual shared values — never commit real secrets):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Running the Application

Start the server in development mode (auto-restarts on file changes):
```
npm run dev
```

Or in production mode:
```
npm start
```

On a successful start, you should see:
```
MongoDB connected: ...
Server running on port 5000
```

## API Overview

All responses follow a consistent format:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": { }
}
```

Errors follow the same shape with `"success": false` and `"data": null`.

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in, receive a JWT | No |
| GET | `/api/auth/me` | Get the logged-in user's profile | Yes |

### Conversations & Messages
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/conversations` | Create or fetch a conversation | Yes |
| GET | `/api/conversations` | List the logged-in user's conversations | Yes |
| POST | `/api/conversations/:conversationId/messages` | Send a message | Yes |
| GET | `/api/conversations/:conversationId/messages` | Get message history (paginated) | Yes |
| PATCH | `/api/messages/:messageId/delivered` | Mark a message as delivered | Yes |
| PATCH | `/api/messages/:messageId/read` | Mark a message as read | Yes |

Full endpoint documentation, including request/response examples, is available in the exported Postman collection: [`docs/chat-app-backend.postman_collection.json`](./docs/chat-app-backend.postman_collection.json).

### Real-Time Events (Socket.IO)

Connect with a valid JWT, either via the `auth` payload or as a `?token=` query parameter:

```js
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```

| Event | Direction | Payload | Description |
|---|---|---|---|
| `user:online` | Server → Client | `userId` | Broadcast when a user connects |
| `user:offline` | Server → Client | `userId` | Broadcast when a user disconnects |
| `conversation:join` | Client → Server | `conversationId` | Joins a conversation's real-time room |
| `typing:start` | Client ↔ Server | `conversationId` | Broadcasts that a user started typing |
| `typing:stop` | Client ↔ Server | `conversationId` | Broadcasts that a user stopped typing |

## Testing

- Manual endpoint testing via Postman (collection shared with the team)
- Manual Socket.IO connection/event testing via Postman's Socket.IO client
- Automated test scripts covering message read-receipt flows (see `/test`)

To run automated tests:
```
node test/readReceiptTest.js
node test/socketTest.js
```

## Deployment

- **Platform:** Render (free tier)
- **Live API URL:** https://chat-app-backend-ukcp.onrender.com

Note: the free instance spins down after periods of inactivity. The first
request after idle time can take up to ~50 seconds to respond while the
server wakes up.

## Team / Contributions

| Task | Owner |
|---|---|
| Authentication & Users | Fortune |
| Presence & Sockets | Gbengolo |
| Conversations & Messages | Aderonke |
| Read Receipts & Message Status | sirmoel |
| Validation, Docs & Testing | Gbengolo (interim) |

## Group

Group 19 — Real-Time Chat App — TS Academy Backend Development Capstone
