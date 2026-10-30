import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BOOTSTRAPPED_ADMIN_EMAIL } from '../../firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    currentUser, 
    isAdmin, 
    loginWithEmail, 
    sendPasswordReset,
    logout, 
    devAdminBypass, 
    toggleDevAdminBypass 
  } = useStore();

  const [email, setEmail] = useState(BOOTSTRAPPED_ADMIN_EMAIL);
  const [password, setPassword] = useState('MD@ibran2092');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await loginWithEmail(email, password);
      setSuccessMsg('Admin login successful!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password. Please verify credentials or reset your password.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('No user account found with this email.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please check network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your admin email address.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await sendPasswordReset(email);
      setSuccessMsg(`A password reset link has been dispatched to ${email}. Check your inbox!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = () => {
    toggleDevAdminBypass();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">
            {isForgotPassword ? 'Admin Password Recovery' : 'ECOMART Admin Portal'}
          </h3>
          <p className="text-xs text-stone-500 max-w-xs">
            {isForgotPassword 
              ? 'Enter your registered admin email address to receive a secure Firebase password reset link.'
              : 'Secure administrator access to manage products, direct photo uploads, live inventory, orders, and GST invoices.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current Auth Status Card */}
        {currentUser && (
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-semibold text-stone-700">
              <span>Signed in as:</span>
              <span className="font-mono text-stone-900">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Role:</span>
              {isAdmin ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authorized Admin
                </span>
              ) : (
                <span className="font-bold text-red-600">Unauthorized (Needs {BOOTSTRAPPED_ADMIN_EMAIL})</span>
              )}
            </div>
          </div>
        )}

        {/* Form: Email & Password or Forgot Password */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Registered Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@ecomart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <span>{isLoading ? 'Dispatching Reset Link...' : 'Send Password Reset Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-center text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center justify-center gap-1 pt-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Admin Login</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder={BOOTSTRAPPED_ADMIN_EMAIL}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-stone-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[11px] text-emerald-800 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-900 hover:bg-emerald-950 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>

            <p className="text-[11px] text-stone-400 text-center">
              Public Admin Registration is strictly disabled.
            </p>
          </form>
        )}

        {/* Developer Admin Preview Option */}
        <div className="pt-3 border-t border-stone-200/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1 font-semibold text-amber-900">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Instant Admin Preview Mode
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              Development
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            Evaluate the complete admin panel, test direct photo uploads, live order transitions, stock deductions, and GST invoices instantly.
          </p>
          <button
            onClick={handleDevBypass}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
              devAdminBypass
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{devAdminBypass ? 'Admin Preview Active (Click to Enter)' : 'Enable Admin Preview & Enter'}</span>
          </button>
        </div>

        {currentUser && (
          <button
            onClick={logout}
            className="text-xs text-stone-500 hover:text-stone-800 font-medium text-center"
          >
            Sign Out Session
          </button>
        )}
      </div>
    </div>
  );
};
