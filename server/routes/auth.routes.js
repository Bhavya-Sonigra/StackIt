// routes/auth.routes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser } from '../controllers/auth.controller.js';
import { signAccess, signRefresh } from '../utils/tokens.js';
import User from '../models/User.model.js';

const router = express.Router();

/* ---------------------------------------------
   Local Auth Routes
--------------------------------------------- */
router.post('/register', registerUser);
router.post('/login', loginUser);

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
    await User.updateOne({ refreshToken: req.cookies.jid }, { $unset: { refreshToken: 1 } });
    res.clearCookie('jid');
    res.status(204).end();
  } catch {
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

      res.redirect('http://localhost:3000/dashboard'); // NO token in URL
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