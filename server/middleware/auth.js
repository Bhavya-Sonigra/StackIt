import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no Bearer token, try to get from cookies
    if (!token) {
      token = req.cookies.jid;
    }
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Try to verify as access token first, then as refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (accessError) {
      try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        // If it's a refresh token, verify the user has this token
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
          throw new Error('Invalid refresh token');
        }
      } catch (refreshError) {
        return res.status(401).json({ error: 'Token is not valid' });
      }
    }

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.banned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default auth; 