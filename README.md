# Real-Time Chat App — Backend

A backend MVP for a real-time chat application, built for the TS Academy Backend Development Capstone (Group 19).

## Description

This backend powers a real-time messaging platform where users can register, log in, see who's online, start conversations (direct or group), exchange messages in real time, and see delivery/read status on their messages.

## Problem Being Solved

Most chat products need a backend that can handle live presence, message delivery, and read receipts reliably — not just store messages, but track *state* (who's online, has a message been seen) in real time. This project demonstrates a working implementation of that core flow, end to end, through a REST + WebSocket API.

## Target Users

- **General users** — register, log in, see who's online, start direct or group conversations, send/receive messages, see read receipts.
- **(Optional/future)** Admins — moderate users or conversations.

## MVP Features

- User registration, login, and password reset (JWT-based authentication)
- Password hashing (bcrypt) — passwords are never stored or returned in plain text
- Real-time online/offline presence tracking via Socket.IO
- Typing indicators, scoped to individual conversations
- Create and list conversations between users, direct (1:1) or group (3+ people)
- Look up a user by email to start a conversation
- Send and retrieve messages, with pagination
- Per-recipient message status tracking (sent / delivered / read)
- Consistent API response format across all endpoints
- Protected routes requiring a valid JWT
- A working browser-based frontend demo (see below)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time layer:** Socket.IO
- **Database:** MongoDB (via Mongoose)
- **Auth:** JSON Web Tokens (JWT) + bcrypt
- **Validation:** Joi
- **API docs:** Swagger (OpenAPI 3.0)
- **Dev tooling:** nodemon, Jest

## Database

MongoDB, hosted on MongoDB Atlas. Core collections:

| Collection | Purpose |
|---|---|
| `users` | Registered accounts — username, email, hashed password, timestamps |
| `conversations` | Groups of participants who share a message thread (direct or group, with an optional group name) |
| `messages` | Individual messages, including per-recipient delivery/read status |

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database connection setup
│   ├── controllers/    # Route handler logic
│   ├── middleware/      # Auth protection, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   ├── socket/           # Socket.IO event handlers
│   ├── utils/            # Helpers (JWT signing/verification, custom errors, Swagger setup)
│   ├── validations/      # Joi validation schemas
│   └── app.js            # App entry point (Express + Socket.IO server)
├── docs/
│   ├── index.html                            # Frontend demo (also deployed via GitHub Pages)
│   └── chat-app-backend.postman_collection.json
├── tests/                 # Automated tests
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

## Frontend Demo

A browser-based client for this API is included in the repo:

- **Live demo:** https://gbengolo.github.io/Chat-app-backend/
- **Source:** [`docs/index.html`](./docs/index.html)

Covers registration, login, forgot password, direct and group conversations
(start a chat or group by email), live message updates, read-receipt ticks,
typing indicators, unread badges, and online presence — all running against
the live API below. It's a self-contained HTML file with no build step;
opening it directly in a browser works the same way.

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

Full, interactive API documentation is also available live via Swagger:
**https://chat-app-backend-ukcp.onrender.com/api-docs**

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in, receive a JWT | No |
| POST | `/api/auth/reset-password` | Reset a password (email + new password — demo-level, no email verification) | No |
| GET | `/api/auth/me` | Get the logged-in user's profile | Yes |
| GET | `/api/auth/users/find?email=` | Look up a user's id by email (used to start a conversation) | Yes |

### Conversations & Messages
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/conversations` | Create or fetch a conversation. Accepts `participantId` (direct) or `participantIds` + optional `name` (group) | Yes |
| GET | `/api/conversations` | List the logged-in user's conversations | Yes |
| POST | `/api/conversations/:conversationId/messages` | Send a message | Yes |
| GET | `/api/conversations/:conversationId/messages` | Get message history (paginated) | Yes |
| PATCH | `/api/messages/:messageId/delivered` | Mark a message as delivered (called by the recipient) | Yes |
| PATCH | `/api/messages/:messageId/read` | Mark a message as read (called by the recipient) | Yes |

Full endpoint documentation, including request/response examples, is also available in the exported Postman collection: [`docs/chat-app-backend.postman_collection.json`](./docs/chat-app-backend.postman_collection.json).

### Real-Time Events (Socket.IO)

Connect with a valid JWT, either via the `auth` payload or as a `?token=` query parameter:

```js
const socket = io('https://chat-app-backend-ukcp.onrender.com', {
  auth: { token: 'your_jwt_token' }
});
```

| Event | Direction | Payload | Description |
|---|---|---|---|
| `presence:init` | Server → Client | `userId[]` | Sent once on connect: everyone already online |
| `user:online` | Server → Client | `userId` | Broadcast when a user connects |
| `user:offline` | Server → Client | `userId` | Broadcast when a user disconnects |
| `conversation:join` | Client → Server | `conversationId` | Joins a conversation's real-time room |
| `typing:start` | Client ↔ Server | `conversationId` | Broadcasts that a user started typing |
| `typing:stop` | Client ↔ Server | `conversationId` | Broadcasts that a user stopped typing |
| `message:delivered` | Client → Server | `{ messageId }` | Alternate (socket) way to mark a message delivered |
| `message:read` | Client → Server | `{ messageId }` | Alternate (socket) way to mark a message read |
| `message:status` | Server → Client | `{ messageId, userId, status, deliveredAt, readAt }` | Sent to the sender when a recipient's status changes |

## Testing

- Automated tests: `tests/auth.test.js` (Jest + Supertest), covering registration and login validation
- Automated tests: `test/readReceiptTest.js` and `test/socketTest.js`, covering the full message → delivered → read flow and live Socket.IO event delivery
- Manual endpoint testing via Postman (collection in `docs/`, with saved real request/response examples)
- Manual Socket.IO connection/event testing via Postman's Socket.IO client
- Full end-to-end manual testing via the live frontend demo

To run the automated tests:
```
npm test
node test/readReceiptTest.js
node test/socketTest.js
```

## Deployment

- **Backend platform:** Render (free tier)
- **Live API URL:** https://chat-app-backend-ukcp.onrender.com
- **API docs:** https://chat-app-backend-ukcp.onrender.com/api-docs
- **Frontend platform:** GitHub Pages
- **Live frontend URL:** https://gbengolo.github.io/Chat-app-backend/

Note: the backend's free Render instance spins down after periods of
inactivity. The first request after idle time can take up to ~50 seconds to
respond while the server wakes up.

## Team / Contributions

| Task | Owner |
|---|---|
| Authentication & Users | Fortune |
| Presence & Sockets | Gbengolo |
| Conversations & Messages | Aderonke |
| Read Receipts & Message Status | sirmoel |
| Validation, Error Handling, Docs & Testing | Samuel |

## Group

Group 19 — Real-Time Chat App — TS Academy Backend Development Capstone
