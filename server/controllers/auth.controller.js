// controllers/auth.controller.js
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import { signAccess, signRefresh } from '../utils/tokens.js';

/* ------------------------------------------------------------------ */
/*  Register                                                          */
/* ------------------------------------------------------------------ */
export const registerUser = async (req, res) => {
  const { username, name, email, password } = req.body;

  try {
    // 1  duplicates
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res.status(400).json({ message: 'E-mail or username already in use' });

    // 2  hash pw
    const hashed = await bcrypt.hash(password, 10);

    // 3  create user
    const user = await User.create({
      username,
      name,
      email,
      password: hashed,
      isAdmin: false,
      banned: false
    });

    // 4  tokens
    const accessToken  = signAccess ({ id: user._id, isAdmin: false, banned: false });
    const refreshToken = signRefresh({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    // 5  refresh token cookie
    res.cookie('jid', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    // 6  response
    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

/* ------------------------------------------------------------------ */
/*  Login (e-mail **or** username)                                    */
/* ------------------------------------------------------------------ */
export const loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;       // 👈 Update client side accordingly

  try {
    // 1  find user
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    if (!user || !user.password)
      return res.status(400).json({ message: 'Invalid credentials' });

    // 2  banned?
    if (user.banned)
      return res.status(403).json({ message: 'Account is banned' });

    // 3  pw match
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ message: 'Incorrect password' });

    // 4  tokens
    const accessToken  = signAccess ({ id: user._id, isAdmin: user.isAdmin, banned: false });
    const refreshToken = signRefresh({ id: user._id });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    // 5  response
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};