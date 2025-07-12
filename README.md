# StackIt Backend

A Q&A platform backend built with Node.js, Express, and MongoDB, featuring user authentication, question/answer management, voting, and admin moderation.

## Features

- **User Authentication**: Local registration/login with JWT tokens
- **Google OAuth**: Social login with Google
- **Q&A Management**: Create, read, update, delete questions and answers
- **Voting System**: Upvote/downvote answers
- **Answer Acceptance**: Question owners can mark answers as accepted
- **Notifications**: User notification system
- **Admin Panel**: User moderation, content management
- **Tag Filtering**: Filter questions by tags

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js (Google OAuth)
- **Module System**: ES Modules

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/stackit

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# JWT Token Expiration
ACCESS_TTL=15m
REFRESH_TTL=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK=http://localhost:5000/api/auth/google/callback

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Run the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Questions
- `GET /api/questions` - Get all questions (with optional tag filter)
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question (requires auth)
- `PUT /api/questions/:id` - Update question (requires auth, author only)
- `DELETE /api/questions/:id` - Delete question (requires auth, author or admin)
- `PUT /api/questions/:id/accept` - Accept answer (requires auth, question owner only)

### Answers
- `GET /api/answers/question/:questionId` - Get all answers for a question
- `POST /api/answers` - Create new answer (requires auth)
- `PUT /api/answers/:id` - Update answer (requires auth, author only)
- `DELETE /api/answers/:id` - Delete answer (requires auth, author or admin)
- `POST /api/answers/:id/upvote` - Upvote answer (requires auth)
- `POST /api/answers/:id/downvote` - Downvote answer (requires auth)

### Notifications
- `GET /api/notifications/:userId` - Get user notifications (requires auth, owner only)
- `PUT /api/notifications/:id/read` - Mark notification as read (requires auth, owner only)
- `POST /api/notifications` - Create notification (requires auth, admin or self)

### Admin
- `GET /api/admin/users` - Get all users (requires auth + admin)
- `PUT /api/admin/users/:id/ban` - Ban user (requires auth + admin)
- `PUT /api/admin/users/:id/unban` - Unban user (requires auth + admin)
- `DELETE /api/admin/questions/:id` - Delete question (requires auth + admin)
- `DELETE /api/admin/answers/:id` - Delete answer (requires auth + admin)

## Authentication

### JWT Token Usage
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Google OAuth
1. Set up Google OAuth credentials in Google Cloud Console
2. Configure the callback URL
3. Users can login via `/api/auth/google`

## Data Models

### User
- `username` (optional, for local users)
- `name` (optional, for Google users)
- `email` (required, unique)
- `password` (optional, hashed, for local users)
- `googleId` (optional, for Google users)
- `refreshToken` (for JWT refresh)
- `isAdmin` (boolean, default: false)
- `banned` (boolean, default: false)
- `createdAt` (timestamp)

### Question
- `title` (required)
- `description` (required, HTML)
- `tags` (array of strings)
- `authorId` (reference to User)
- `answers` (array of Answer references)
- `acceptedAnswer` (reference to Answer, optional)
- `votes` (number, default: 0)
- `createdAt`, `updatedAt` (timestamps)

### Answer
- `questionId` (reference to Question)
- `authorId` (reference to User)
- `description` (required, HTML)
- `votes` (number, default: 0)
- `createdAt`, `updatedAt` (timestamps)

### Notification
- `userId` (reference to User)
- `type` (string: "answer", "comment", "mention")
- `message` (string)
- `read` (boolean, default: false)
- `createdAt` (timestamp)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (user/admin)
- Input validation and sanitization
- CORS configuration
- Secure cookie settings

## Development

### Project Structure
```
server/
├── config/          # Database and passport configuration
├── controllers/     # Business logic
├── middleware/      # Auth and admin middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── app.js           # Express app configuration
├── server.js        # Server entry point
└── package.json
```

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (not implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC 