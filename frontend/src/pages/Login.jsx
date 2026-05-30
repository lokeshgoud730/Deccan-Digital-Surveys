import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, User, AlertCircle, Loader } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('admin_username', username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 transition-colors duration-300 dark:bg-zinc-900 bg-slate-50">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-zinc-800/50">
        
        {/* Branding Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 font-sans tracking-tight">
            Owner Access
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Sign in to manage bookings, gallery, and site content.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center space-x-2 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200/30">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark dark:bg-survey-gold dark:text-slate-950 dark:hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
