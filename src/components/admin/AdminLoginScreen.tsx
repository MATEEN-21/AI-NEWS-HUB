import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertTriangle, KeyRound, CheckCircle2, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { BrandLogo } from '../BrandLogo.tsx';
import { api } from '../../services/api.ts';

interface AdminLoginScreenProps {
  onLogin: (loginId: string, pass: string) => Promise<void>;
  onNavigate: (path: string) => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onLogin,
  onNavigate,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetRecoveryCode, setResetRecoveryCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      await api.resetPassword(
        resetEmail.trim(),
        resetRecoveryCode.trim(),
        resetNewPassword,
        resetConfirmPassword
      );
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setResetSuccess(false);
        setEmail(resetEmail);
      }, 2500);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. Please check your recovery code.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white px-8 py-7">
          <div className="flex items-center justify-between mb-4">
            <BrandLogo variant="dark" size="sm" />
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Site</span>
            </button>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Admin Portal Login
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorized administrator access to manage website content and system settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered admin email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Admin Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Admin Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin panel password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Log In to Admin Panel</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              Only authorized site administrators may log in. Sessions are encrypted and time-bound.
            </p>
          </div>
        </form>
      </div>

      {/* Forgot Password / Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <span>Reset Admin Password</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Password Reset Successful!</h3>
                <p className="text-xs text-slate-500">
                  Your administrator password has been updated. You can now log in with your new password.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5 text-left">
                <p className="text-xs text-slate-500">
                  Enter your admin email and the emergency recovery code provided during setup to reset your password.
                </p>

                {resetError && (
                  <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@yourdomain.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Emergency Recovery Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={resetRecoveryCode}
                    onChange={(e) => setResetRecoveryCode(e.target.value)}
                    placeholder="e.g. ATH-XXXX-XXXX"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    New Admin Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors"
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
