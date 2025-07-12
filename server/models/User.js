import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true }, // for local users
  name: { type: String }, // for Google users
  email: { type: String, required: true, unique: true },
  password: { type: String }, // for local users (hashed)
  googleId: { type: String }, // for Google users
  refreshToken: { type: String }, // for JWT refresh
  isAdmin: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
export default User;