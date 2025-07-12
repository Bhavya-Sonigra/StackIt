'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { api } from '@/utils/api';

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      // Store the access token in memory or secure storage
      // Note: refresh token is handled by httpOnly cookie automatically
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      router.push('/');
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
        <h2 className="text-4xl font-bold text-center text-purple-700 mb-2 drop-shadow">Sign in to your account</h2>
        <p className="text-center text-base text-gray-500 mb-6">
          Or{' '}
          <Link href="/register" className="font-semibold text-pink-500 hover:text-purple-600 transition">
            create a new account
          </Link>
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-pink-100 border border-pink-300 text-pink-700 px-4 py-3 rounded-md text-center">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-purple-700 mb-1">
              Email address or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                autoComplete="email"
                required
                value={formData.emailOrUsername}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-purple-50"
                placeholder="Enter your email or username"
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
                autoComplete="current-password"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg hover:from-pink-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="text-pink-500 hover:text-purple-600 text-sm font-semibold"
            >
              Sign in with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}