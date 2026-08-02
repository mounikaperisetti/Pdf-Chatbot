import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Toast from '../components/Common/Toast';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiBookOpen } from 'react-icons/fi';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation / Toast State
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await register(fullName, email, password);
    setIsSubmitting(false);

    if (result.success) {
      setToast({ message: 'Account created successfully! Redirecting...', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setToast({ message: result.error, type: 'error' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100/50">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <FiBookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-800">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Start parsing your PDF files with AI
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            
            {/* Full Name */}
            <div>
              <label htmlFor="full-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiUser className="h-5 w-5" />
                </div>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  disabled={isSubmitting}
                  className={`block w-full rounded-xl border pl-10 pr-3 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                    ${validationErrors.fullName ? 'border-red-300 bg-red-50/10 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200'}`}
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (validationErrors.fullName) setValidationErrors(prev => ({ ...prev, fullName: null }));
                  }}
                />
              </div>
              {validationErrors.fullName && (
                <p className="mt-1 text-xs text-red-500 font-medium">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiMail className="h-5 w-5" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`block w-full rounded-xl border pl-10 pr-3 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                    ${validationErrors.email ? 'border-red-300 bg-red-50/10 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200'}`}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: null }));
                  }}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isSubmitting}
                  className={`block w-full rounded-xl border pl-10 pr-10 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                    ${validationErrors.password ? 'border-red-300 bg-red-50/10 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200'}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: null }));
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  disabled={isSubmitting}
                  className={`block w-full rounded-xl border pl-10 pr-3 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200
                    ${validationErrors.confirmPassword ? 'border-red-300 bg-red-50/10 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200'}`}
                  placeholder="••••••••"
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
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Sign in
            </Link>
          </p>
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

export default Register;
