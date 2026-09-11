import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertTriangle, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../BrandLogo.tsx';

interface AdminSetupScreenProps {
  onSetupSuccess: (recoveryCode: string) => void;
  setupAdmin: (email: string, pass: string, confirmPass: string) => Promise<{ recoveryCode: string }>;
}

export const AdminSetupScreen: React.FC<AdminSetupScreenProps> = ({
  onSetupSuccess,
  setupAdmin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRecoveryCode, setCreatedRecoveryCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid administrative email address.');
      return;
    }

    if (password.length < 6) {
      setError('Admin password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords you entered do not match. Please re-enter them carefully.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setupAdmin(cleanEmail, password, confirmPassword);
      setCreatedRecoveryCode(res.recoveryCode);
    } catch (err: any) {
      setError(err.message || 'Failed to complete admin account setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdRecoveryCode) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Admin Setup Complete!
            </h2>
            <p className="text-sm text-slate-600">
              Your website administrator account has been created and securely encrypted.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-left">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Your Emergency Recovery Code</span>
            </div>
            <p className="font-mono text-base font-black text-blue-700 tracking-wider bg-white px-3 py-2 rounded-lg border border-slate-200 select-all text-center">
              {createdRecoveryCode}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Save this code in a secure location. You can use it to reset your Admin Panel password if you ever forget it.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSetupSuccess(createdRecoveryCode)}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Proceed to Admin Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white px-8 py-7">
          <div className="flex items-center justify-between mb-4">
            <BrandLogo variant="dark" size="sm" />
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Initial Setup</span>
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Admin Account Setup
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Configure your administrative credentials to manage articles, AI tools, images, and website settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Important Security Warning Box */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Important Security Notice</span>
            </div>
            <ul className="text-xs text-amber-800/90 list-disc pl-4 space-y-1">
              <li>
                <strong>Do NOT enter your personal Gmail / Google password.</strong>
              </li>
              <li>
                This password is strictly dedicated to your website Admin Panel.
              </li>
              <li>
                Your password will be encrypted using scrypt hashing and will never be shown in plaintext or source code.
              </li>
            </ul>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Admin Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              1. Admin Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              You will use this email address whenever logging into the Admin Panel.
            </p>
          </div>

          {/* 2. Admin Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Admin Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create website admin password (min 6 chars)"
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

          {/* 3. Confirm Admin Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Confirm Admin Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype password to confirm"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <span>Configuring Admin Account...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Setup & Create Admin Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
