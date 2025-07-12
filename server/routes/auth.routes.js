// routes/auth.routes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser } from '../controllers/auth.controller.js';
import { signAccess, signRefresh } from '../utils/token.js';
import User from '../models/User.js';

const router = express.Router();

/* ---------------------------------------------
   Local Auth Routes
--------------------------------------------- */
router.post('/register', registerUser);
router.post('/login', loginUser);

/* ---------------------------------------------
   Get Current User
--------------------------------------------- */
router.get('/me', async (req, res) => {
  try {
    let token = null;

    // 🔷 1. Try access token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 🔷 2. If not, try refresh token from cookie
    if (!token && req.cookies.jid) {
      token = req.cookies.jid;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let payload;
    try {
      // 🔷 3. First try to verify as access token
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      console.log('Access token failed, trying refresh...');
      // 🔷 4. If that fails, try refresh token
      try {
        payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // Make sure refresh token is current in DB
        const userWithToken = await User.findById(payload.id);
        if (!userWithToken || userWithToken.refreshToken !== token) {
          return res.status(401).json({ message: 'Session invalid. Please log in again.' });
        }
      } catch (err2) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    }

    // 🔷 5. Find user
    const user = await User.findById(payload.id).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Authentication failed' });
  }
});


/* ---------------------------------------------
   Refresh Token
--------------------------------------------- */
router.post('/refresh', async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).json({ message: 'Missing refresh token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== token) throw new Error();

    const accessToken = signAccess({
      id: user._id,
      isAdmin: user.isAdmin,
      banned: user.banned
    });

    res.json({ accessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

/* ---------------------------------------------
   Logout
--------------------------------------------- */
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.jid;

    if (token) {
      // clear refreshToken from DB if it matches cookie
      await User.updateOne({ refreshToken: token }, { $unset: { refreshToken: 1 } });
    }

    res.clearCookie('jid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/', // ensure matches login
    });

    res.status(204).end();
  } catch (err) {
    console.error('Logout error', err);
    res.status(500).json({ message: 'Logout error' });
  }
});


/* ---------------------------------------------
   Google OAuth Flow
--------------------------------------------- */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/auth/failure'
  }),
  async (req, res) => {
    try {
      const accessToken = signAccess({
        id: req.user._id,
        isAdmin: req.user.isAdmin,
        banned: false
      });

      const refreshToken = signRefresh({ id: req.user._id });

      await User.findByIdAndUpdate(req.user._id, { refreshToken });

      res.cookie('jid', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });

      // Redirect with a success flag so the client knows to check auth
      res.redirect('http://localhost:3000?auth=success');
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect('/api/auth/failure');
    }
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Google login failed' });
});

export default router;