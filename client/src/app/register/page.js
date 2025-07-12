'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { api } from '../../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      // After successful registration, redirect to login
      router.push('/login');
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
        <h2 className="text-4xl font-bold text-center text-purple-700 mb-2 drop-shadow">Create your account</h2>
        <p className="text-center text-base text-gray-500 mb-6">
          Or{' '}
          <Link href="/login" className="font-semibold text-pink-500 hover:text-purple-600 transition">
            sign in to your existing account
          </Link>
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-pink-100 border border-pink-300 text-pink-700 px-4 py-3 rounded-md text-center">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-purple-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-purple-50"
                placeholder="Enter your username"
              />
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-purple-50"
                placeholder="Enter your full name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-purple-50"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-purple-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2 border border-purple-200 rounded-lg placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-purple-50"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-pink-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2 border border-purple-200 rounded-lg placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-purple-50"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-pink-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg hover:from-pink-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}