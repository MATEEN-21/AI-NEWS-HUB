import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
  Key
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface AdminSecurityCardProps {
  token: string;
  onNotification?: (msg: string, type: 'success' | 'error') => void;
  className?: string;
}

export const AdminSecurityCard: React.FC<AdminSecurityCardProps> = ({
  token,
  onNotification,
  className = '',
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match. Please verify your entry.');
      return;
    }

    setChangingPass(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmNewPassword, token);
      const msg = res.message || 'Admin password updated successfully.';
      setPassSuccess(msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      if (onNotification) {
        onNotification('Password changed successfully!', 'success');
      }
    } catch (e: any) {
      setPassError(e.message || 'Failed to update password. Verify your current password.');
      if (onNotification) {
        onNotification(e.message || 'Failed to update password', 'error');
      }
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div id="admin-security-card" className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Admin Security & Password</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your Admin Panel credentials securely. Never share your password with anyone.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 self-start sm:self-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Authenticated Session</span>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
        {passError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        {passSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Current Password *
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current admin password"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all pr-10"
            />
            <Key className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password (min 6 chars) *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password *
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 cursor-pointer self-start"
          >
            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPass ? 'Hide Passwords' : 'Show Passwords'}</span>
          </button>

          <button
            type="submit"
            disabled={changingPass || !currentPassword || !newPassword || !confirmNewPassword}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{changingPass ? 'Updating Password...' : 'Save New Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Also export as SettingsTab for backward compatibility
export const SettingsTab = AdminSecurityCard;
