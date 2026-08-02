import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import Toast from '../components/Common/Toast';
import { 
  FiUser, 
  FiLock, 
  FiLogOut, 
  FiSettings, 
  FiCheckCircle, 
  FiClock,
  FiMail
} from 'react-icons/fi';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Notifications State
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!oldPassword) {
      errors.oldPassword = 'Current password is required.';
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters.';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'New passwords do not match.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUpdating(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      setToast({ message: 'Password updated successfully!', type: 'success' });
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setValidationErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update password. Verify your current password.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* User Card info panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
            {/* Initials avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 mb-4 border border-blue-50">
              {user?.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">{user?.fullName}</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 flex items-center space-x-1 justify-center mt-1">
              <FiMail className="h-3 w-3" />
              <span>{user?.email}</span>
            </p>

            {/* Profile Statistics info */}
            <div className="w-full border-t border-slate-100 pt-6 space-y-4 text-left">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <FiClock className="h-4 w-4" />
                  <span>Joined On</span>
                </span>
                <span className="text-slate-700">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center space-x-1.5 text-slate-400">
                  <FiUser className="h-4 w-4" />
                  <span>Account Status</span>
                </span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center space-x-1">
                  <FiCheckCircle className="h-3 w-3 animate-pulse" />
                  <span>Verified</span>
                </span>
              </div>
            </div>

            {/* Redundant settings logout button */}
            <button
              onClick={handleLogoutClick}
              className="mt-8 flex w-full justify-center items-center space-x-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 transition-colors"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Sign Out Account</span>
            </button>
          </div>
        </div>

        {/* Change password panel */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Update Password</h3>
            <p className="text-sm text-slate-500 mb-6">
              Change your login password. We recommend using a unique password that you do not reuse elsewhere.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              {/* Current Password */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FiLock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    disabled={isUpdating}
                    className={`block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400
                      ${validationErrors.oldPassword ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : ''}`}
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (validationErrors.oldPassword) setValidationErrors(prev => ({ ...prev, oldPassword: null }));
                    }}
                  />
                </div>
                {validationErrors.oldPassword && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{validationErrors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FiLock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    disabled={isUpdating}
                    className={`block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400
                      ${validationErrors.newPassword ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : ''}`}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (validationErrors.newPassword) setValidationErrors(prev => ({ ...prev, newPassword: null }));
                    }}
                  />
                </div>
                {validationErrors.newPassword && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{validationErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <FiLock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    disabled={isUpdating}
                    className={`block w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400
                      ${validationErrors.confirmPassword ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' : ''}`}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
                    }}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Save password button */}
              <button
                type="submit"
                disabled={isUpdating}
                className="flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/15 hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Settings;
