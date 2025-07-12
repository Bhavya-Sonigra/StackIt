import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js'; 
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: 'keyboardcat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

export default app;