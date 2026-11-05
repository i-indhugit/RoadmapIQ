import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from './Modal';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  LogOut,
  UserCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { currentUser, login, register, continueAsGuest, logout, activeTheme } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const primaryColor = activeTheme?.palette?.primary || '#00d2ff';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await continueAsGuest(displayName || 'Student Explorer');
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize guest session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        currentUser && !currentUser.is_guest
          ? 'Student Account'
          : mode === 'login'
          ? 'Welcome Back to RoadmapIQ'
          : 'Create Your RoadmapIQ Account'
      }
      maxWidth="max-w-md"
    >
      {/* If already logged in as a registered user */}
      {currentUser && !currentUser.is_guest ? (
        <div className="space-y-6 py-2">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-slate-950 shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {(currentUser.display_name || currentUser.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-slate-100 truncate">{currentUser.display_name}</h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your career target, interactive roadmap progress, notes, and XP are securely linked to your account.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-sm border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Tabs for Login vs Register */}
          <div className="flex rounded-lg bg-slate-900/80 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {currentUser?.is_guest && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-start space-x-2.5 text-xs text-cyan-200">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Exploring as Guest:</span> Sign in or register to permanently sync your roadmaps and achievements across all your devices.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start space-x-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Alex Chen"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-slate-950 transition-all shadow-md disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-2 flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={handleGuest}
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4 text-slate-400" />
            <span>Continue as Guest Explorer</span>
          </button>
        </div>
      )}
    </Modal>
  );
}
