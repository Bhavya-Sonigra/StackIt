import jwt from 'jsonwebtoken';

export default (roles = ['user']) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (payload.banned) return res.status(403).json({ message: 'Account banned' });
    if (!roles.includes(payload.isAdmin ? 'admin' : 'user'))
      return res.status(403).json({ message: 'Forbidden' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid / expired token' });
  }
};