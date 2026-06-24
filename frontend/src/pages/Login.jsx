import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Lock, User, AlertCircle, Loader, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode state: 'login', 'forgot', 'reset'
  const [mode, setMode] = useState('login');
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Reset password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Token URL parameters
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');

  // General statuses
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const action = searchParams.get('action');
    const urlUid = searchParams.get('uid');
    const urlToken = searchParams.get('token');

    if (action === 'reset' && urlUid && urlToken) {
      setMode('reset');
      setUid(urlUid);
      setToken(urlToken);
    } else {
      setMode('login');
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/token/', { username, password });
      localStorage.setItem('is_admin', 'true');
      localStorage.setItem('admin_username', username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/password-reset/', { email: forgotEmail });
      setResetSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword
      });
      setResetSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Link might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 transition-colors duration-300 dark:bg-zinc-950 bg-slate-50 text-slate-900 dark:text-zinc-100">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900">
        
        {/* VIEW 1: STANDARD SIGN IN */}
        {mode === 'login' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 font-sans tracking-tight">
                Owner Access
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                Sign in to manage bookings, CMS, gallery, and site settings.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200/30">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                    }}
                    className="text-xs text-primary dark:text-blue-400 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-50 shadow-md"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: FORGOT PASSWORD REQUEST */}
        {mode === 'forgot' && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setMode('login');
                setResetSent(false);
                setError('');
              }}
              className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold hover:text-slate-600 dark:hover:text-zinc-300 transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </button>

            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 font-sans tracking-tight">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                Enter your administrative email to receive a password reset link.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200/30">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!resetSent ? (
              <form className="space-y-5" onSubmit={handleRequestReset}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      placeholder="admin@deccandigitalsurveys.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-50 shadow"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center p-6 space-y-4 bg-emerald-50/10 dark:bg-emerald-950/10 rounded-xl border border-emerald-500/10">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Reset Link Dispatched</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  We have sent a security token reset link to your email. Please check your inbox (or console log output in development environment) to set a new password.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SET NEW PASSWORD CONFIRM */}
        {mode === 'reset' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 font-sans tracking-tight">
                New Password
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                Please enter a secure new password for your administrator profile.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200/30">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!resetSuccess ? (
              <form className="space-y-5" onSubmit={handleConfirmReset}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-50 shadow"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : 'Save New Password'}
                </button>
              </form>
            ) : (
              <div className="text-center p-6 space-y-4 bg-emerald-50/10 dark:bg-emerald-950/10 rounded-xl border border-emerald-500/10">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Password Updated!</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Your administrator login credentials have been updated successfully.
                </p>
                <button
                  onClick={() => {
                    setMode('login');
                    setResetSuccess(false);
                    navigate('/login');
                  }}
                  className="w-full py-2.5 bg-primary text-white font-bold rounded-lg transition text-sm shadow"
                >
                  Sign In Now
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
