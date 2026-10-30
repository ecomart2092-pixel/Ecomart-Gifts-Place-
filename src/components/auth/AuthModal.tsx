import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Store, 
  Users, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'retailer' | 'reseller';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultRole = 'retailer' 
}) => {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    sendPasswordReset, 
    currentUser, 
    userProfile, 
    logout 
  } = useStore();

  const [portalRole, setPortalRole] = useState<'retailer' | 'reseller'>(defaultRole);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [payoutUpi, setPayoutUpi] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => onClose(), 800);
      } else if (authMode === 'register') {
        if (!displayName.trim() || !phone.trim()) {
          throw new Error('Please fill in your name and contact phone number.');
        }
        await registerWithEmail(
          email,
          password,
          displayName,
          portalRole,
          phone,
          businessName,
          address,
          payoutUpi
        );
        setSuccessMsg(
          portalRole === 'retailer'
            ? 'Retailer registration submitted! Account is pending quick Admin approval for B2B pricing.'
            : 'Reseller account registered! Welcome to the Reseller Commission Network.'
        );
        setTimeout(() => onClose(), 1500);
      } else if (authMode === 'forgot') {
        await sendPasswordReset(email);
        setSuccessMsg(`Password reset instructions sent to ${email}. Check your email.`);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please sign in or reset your password.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password.');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please check your network and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 relative flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Portal Switch Tabs */}
        <div className="flex rounded-2xl bg-stone-100 p-1 border border-stone-200">
          <button
            type="button"
            onClick={() => {
              setPortalRole('retailer');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              portalRole === 'retailer'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Retailer Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalRole('reseller');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              portalRole === 'reseller'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Reseller Portal</span>
          </button>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-stone-900">
            {portalRole === 'retailer' ? 'Retailer Account' : 'Reseller Partner Account'}
          </h3>
          <p className="text-xs text-stone-500">
            {portalRole === 'retailer'
              ? 'Access wholesale gift pricing, corporate orders, and customized quotes.'
              : 'Earn commissions on gift sales, dropship orders, and track payout balances.'}
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

        {/* Current user session banner */}
        {currentUser && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between">
            <div className="truncate">
              <span className="text-stone-500">Logged in as: </span>
              <span className="font-bold text-stone-900">{currentUser.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-red-600 hover:text-red-700 font-bold ml-2 shrink-0"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Sub-modes: Login vs Register */}
        {authMode !== 'forgot' && (
          <div className="flex border-b border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`py-2 px-4 font-bold border-b-2 transition-all ${
                authMode === 'login'
                  ? portalRole === 'retailer' ? 'border-emerald-800 text-emerald-800' : 'border-purple-800 text-purple-800'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`py-2 px-4 font-bold border-b-2 transition-all ${
                authMode === 'register'
                  ? portalRole === 'retailer' ? 'border-emerald-800 text-emerald-800' : 'border-purple-800 text-purple-800'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              New Registration
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Registration Extra Fields */}
          {authMode === 'register' && (
            <>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Mobile / WhatsApp Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  {portalRole === 'retailer' ? 'Company / Business Name' : 'Reseller / Store Name (Optional)'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Patel Gift Emporium"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              {portalRole === 'retailer' && (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Business Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      placeholder="Shop / Office address for deliveries"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 resize-none"
                    />
                  </div>
                </div>
              )}

              {portalRole === 'reseller' && (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Payout UPI ID (Optional)</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="name@okaxis / 9820012345@paytm"
                      value={payoutUpi}
                      onChange={(e) => setPayoutUpi(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-mono"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email & Password */}
          <div>
            <label className="block font-medium text-stone-700 mb-1">Registered Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-stone-700">Password *</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-[11px] text-emerald-800 hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 ${
              portalRole === 'retailer'
                ? 'bg-emerald-800 hover:bg-emerald-900'
                : 'bg-purple-800 hover:bg-purple-900'
            }`}
          >
            {authMode === 'login' && <LogIn className="w-4 h-4" />}
            {authMode === 'register' && <UserPlus className="w-4 h-4" />}
            <span>
              {isLoading
                ? 'Processing...'
                : authMode === 'login'
                ? `Sign In as ${portalRole === 'retailer' ? 'Retailer' : 'Reseller'}`
                : authMode === 'register'
                ? `Register as ${portalRole === 'retailer' ? 'Retailer' : 'Reseller'}`
                : 'Send Password Reset Email'}
            </span>
          </button>

          {authMode === 'forgot' && (
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="w-full text-center text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center justify-center gap-1 pt-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Sign In</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
