import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('token', data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden mt-12 p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-3">
          <Sparkles className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
          TechTrack AI
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          MNC Interview Prep & ATS Resume Suite
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-6">
        <button
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
            isLogin
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-[#60a5fa] shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <LogIn size={15} />
          Sign In
        </button>
        <button
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
            !isLogin
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-[#60a5fa] shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <UserPlus size={15} />
          Sign Up
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400 rounded-lg p-3 text-xs mb-4 flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-3 pr-10 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isLogin ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
