import jwt from 'jsonwebtoken';

export const signAccess  = (payload) =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET,  { expiresIn: process.env.ACCESS_TTL });

export const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TTL });