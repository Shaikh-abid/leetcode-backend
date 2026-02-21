# 🧑‍💻 LeetCode Clone — Backend

A full-featured backend API for a LeetCode-style coding platform where users can browse problems, write and execute code in multiple languages, track submissions, organize problems into playlists, and get AI-powered code reviews.

## 📌 About

This is the RESTful backend server that powers a LeetCode clone application. It provides authentication (local + Google OAuth), a problem bank with multi-language code execution via the Piston API, submission tracking, playlist management, and an AI code-review feature powered by Hugging Face.

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Runtime** | Node.js |
| **Framework** | Express.js v5 |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (Access + Refresh Tokens), Passport.js (Google OAuth 2.0) |
| **Code Execution** | Piston API (JavaScript, Python, C++, Java) |
| **AI Code Review** | Hugging Face Inference API (Qwen2.5-Coder-32B-Instruct) |
| **Other Libraries** | bcrypt, cookie-parser, cors, dotenv, axios |

## ✨ Features

- **User Authentication** — Register and login with email/password or Google OAuth 2.0. Secure HTTP-only refresh token cookies with JWT-based access tokens.
- **Problem Management** — Create, list, and fetch coding problems by slug. Problems include descriptions, constraints, tags, companies, hints, starter code, driver code, test cases, and solutions.
- **Multi-Language Code Execution** — Run code against test cases in JavaScript, Python, C++, and Java using the Piston execution engine.
- **Submission Tracking** — Submit solutions, automatically evaluate correctness, and persist submission history per user. Solved problems are tracked on the user profile.
- **Playlist Management** — Create custom playlists, add/remove problems, and organize your study plan.
- **AI Code Review** — Get intelligent code reviews with bug analysis, improvement suggestions, and corrected code powered by Hugging Face's Qwen Coder model.
- **User Profiles** — Update bio, city, country, skills, and avatar. Track solved problems over time.

## 📁 Project Structure

```
Backend/
├── config/
│   ├── db.js                  # MongoDB connection
│   └── passport.js            # Google OAuth strategy
├── controller/
│   ├── aiController.js        # AI code review logic
│   ├── authController.js      # Register, login, logout, Google auth
│   ├── playlistController.js  # Playlist CRUD operations
│   ├── problemController.js   # Problem CRUD operations
│   └── submissionController.js# Code execution & submission logic
├── middleware/
│   └── authMiddleware.js      # JWT authentication guard
├── modals/
│   ├── PlaylistModal.js       # Playlist schema
│   ├── ProblemModal.js        # Problem schema
│   ├── SubmissionModal.js     # Submission schema
│   └── UserModal.js           # User schema
├── routes/
│   ├── AiRoutes.js            # /api/ai
│   ├── AuthRoutes.js          # /api/auth
│   ├── PlaylistRoutes.js      # /api/playlists
│   ├── ProblemRoute.js        # /api/problems
│   └── SubmissionRoutes.js    # /api/submissions
├── seed_problems.py           # Python script to seed problem data
├── server.js                  # Entry point — Express app setup
├── package.json
└── .gitignore
```

## 🔗 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login with email & password |
| POST | `/logout` | No | Logout and clear cookies |
| PUT | `/update-profile` | Yes | Update user profile (bio, city, country, skills) |
| GET | `/google` | No | Redirect to Google OAuth |
| GET | `/google/callback` | No | Google OAuth callback |
| POST | `/google-success` | No | Exchange temp token for session after Google login |

### Problems — `/api/problems`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/` | No | Create a new problem |
| GET | `/` | No | Get all problems (title, difficulty, tags, slug) |
| GET | `/getProblemBySlug?slug=two-sum` | No | Get a single problem by its slug |

### Submissions — `/api/submissions`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/run` | No | Run code against test cases (no DB save) |
| POST | `/submit` | Yes | Submit code, evaluate, and save to DB |
| GET | `/user-submissions?slug=two-sum` | Yes | Get current user's submissions for a problem |

### Playlists — `/api/playlists`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/create-playlist` | Yes | Create a new playlist |
| GET | `/get-playlists` | Yes | Get all playlists for the logged-in user |
| POST | `/add-problem` | Yes | Add a problem to a playlist |
| POST | `/remove-problem` | Yes | Remove a problem from a playlist |
| DELETE | `/delete-playlist?id=...` | Yes | Delete a playlist |

### AI — `/api/ai`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/review` | No | Get an AI-powered code review |

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- Google OAuth credentials (for social login)
- Hugging Face API token (for AI code review)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the following variables:

   ```env
   PORT=5000
   DATABASE_URL=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
   CLIENT_URL=<your-frontend-url>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   HF_ACCESS_TOKEN=<your-huggingface-api-token>
   NODE_ENV=development
   ```

4. **Run the server**

   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm start
   ```

   The server will start on `http://localhost:5000`.

## 🗄️ Data Models

- **User** — username, email, password (optional for OAuth), googleId, avatar, solvedProblems, isAdmin, bio, city, country, skills
- **Problem** — title, slug, description, difficulty, constraints, tags, companies, hints, starterCode (multi-lang), driverCode (multi-lang), testCases, solution, settings
- **Submission** — userId, problemId, code, language, status (Accepted / Wrong Answer / Runtime Error / Time Limit Exceeded), runtime
- **Playlist** — userId, title, description, problems (array of Problem references)
