import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MiniBazaarLogo } from '../MiniBazaarLogo';

export const AdminLoginView: React.FC = () => {
  const {
    loginAdmin,
    sendAdminPasswordReset,
    setActiveView,
    isFirebaseConfigured,
  } = useStore();

  // Mode: 'login' | 'recover' | 'recover_success'
  const [mode, setMode] = useState<'login' | 'recover' | 'recover_success'>('login');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery Form States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      const result = await loginAdmin(email, password, rememberMe);
      if (!result.success) {
        setLoginError(result.error || 'خطأ في تسجيل الدخول عبر Firebase Authentication');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!recoveryEmail.trim()) {
      setRecoveryError('يرجى إدخال البريد الإلكتروني المسجل في Firebase Auth.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendAdminPasswordReset(recoveryEmail);
      if (result.success) {
        setRecoverySuccessMsg(`تم إرسال رابط استعادة وتعيين كلمة المرور بنجاح إلى: ${recoveryEmail}`);
        setMode('recover_success');
      } else {
        setRecoveryError(result.error || 'تعذر إرسال رابط استعادة كلمة المرور');
      }
    } catch (err: any) {
      setRecoveryError(err?.message || 'تعذر إرسال الرابط');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-[#E5D8C9] shadow-[0_12px_40px_rgba(111,88,74,0.08)] overflow-hidden transition-all text-right">
        {/* Top Header Decorative Banner */}
        <div className="bg-gradient-to-b from-[#2F2B28] to-[#25211F] text-[#F5E9D8] px-6 pt-8 pb-7 text-center relative overflow-hidden">
          {/* Subtle Golden Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-32 bg-[#C6A36A]/15 blur-2xl rounded-full pointer-events-none" />

          {/* Logo */}
          <div className="flex justify-center mb-3 relative z-10">
            <MiniBazaarLogo variant="compact" inverted={true} textColor="#F5E9D8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6A36A]/20 border border-[#C6A36A]/40 text-[#E7D4BC] text-[11px] font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>بوابة المشرف المعتمدة عبر Firebase Auth</span>
          </div>

          <h2 className="text-lg font-bold text-white font-heading">
            {mode === 'login' && 'تسجيل الدخول إلى لوحة التحكم'}
            {mode === 'recover' && 'استعادة كلمة المرور عبر البريد'}
            {mode === 'recover_success' && 'تم إرسال رابط الاستعادة'}
          </h2>
          <p className="text-xs text-[#D9C1A7] mt-1 max-w-xs mx-auto">
            {mode === 'login' && 'تسجيل الدخول المشفر والمباشر عبر Firebase Authentication'}
            {mode === 'recover' && 'إرسال رابط آمن ومباشر لإعادة تعيين كلمة المرور إلى بريدك المسجل'}
            {mode === 'recover_success' && 'يرجى مراجعة بريدك الإلكتروني والضغط على الرابط لتحديث كلمة المرور'}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          {/* Configuration Warning Notice when Firebase is not configured */}
          {!isFirebaseConfigured && (
            <div className="mb-4 p-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">تنبيه إعدادات Firebase:</span>
                يستخدم التطبيق حالياً إعدادات وهمية افتراضية. لتفعيل تسجيل الدخول واستعادة كلمة المرور، يرجى تحديث ملف <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">firebase-applet-config.json</code> أو متغيرات البيئة ببيانات مشروعك الحقيقي (apiKey و projectId).
              </div>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-[#5F5751] mb-1.5">
                  البريد الإلكتروني للإدارة (Firebase Auth)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@minibazaar.com"
                    className="w-full pl-4 pr-10 py-3 bg-[#FBF8F3] border border-[#D9C1A7] focus:border-[#6F584A] focus:bg-white rounded-[14px] text-xs text-[#2F2B28] placeholder-[#A89F91] transition-all outline-none"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-[#8A7465] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#5F5751]">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recover');
                      setRecoveryEmail(email);
                      setLoginError('');
                    }}
                    className="text-[11px] font-semibold text-[#8A7465] hover:text-[#2F2B28] transition-colors underline underline-offset-2"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-10 py-3 bg-[#FBF8F3] border border-[#D9C1A7] focus:border-[#6F584A] focus:bg-white rounded-[14px] text-xs text-[#2F2B28] placeholder-[#A89F91] transition-all outline-none"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-[#8A7465] absolute right-3.5 top-1/2 -translate-y-1/2" />

                  {/* Show/Hide Password Eye Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8A7465] hover:text-[#2F2B28] rounded-md transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#2F2B28] rounded cursor-pointer"
                  />
                  <span className="text-xs text-[#5F5751]">حفظ الجلسة عبر Firebase Auth</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[14px] font-bold text-xs shadow-md border border-[#4A3E37] transition-all active:scale-98 disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C6A36A]" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#C6A36A]" />
                    <span>دخول لوحة التحكم</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: RECOVERY FORM */}
          {mode === 'recover' && (
            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              {recoveryError && (
                <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5F5751] mb-1.5">
                  البريد الإلكتروني المسجل في Firebase
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="admin@minibazaar.com"
                    className="w-full pl-4 pr-10 py-2.5 bg-[#FBF8F3] border border-[#D9C1A7] focus:border-[#6F584A] focus:bg-white rounded-[12px] text-xs text-[#2F2B28] placeholder-[#A89F91] transition-all outline-none"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-[#8A7465] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#FBF8F3] border border-[#E7D4BC] text-[11px] text-[#7C736D] leading-relaxed">
                سيصلك بريد إلكتروني رسمي من Firebase Authentication يحتوي على رابط آمن لتعيين كلمة مرور جديدة لحسابك.
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setRecoveryError('');
                  }}
                  className="w-1/3 py-2.5 px-3 rounded-[12px] border border-[#D9C1A7] text-[#6F584A] hover:bg-[#F4ECE2] text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[12px] font-bold text-xs border border-[#4A3E37]"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C6A36A]" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-[#C6A36A]" />
                      <span>إرسال رابط الاستعادة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: SUCCESS STATE */}
          {mode === 'recover_success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-100 border border-green-300 text-green-700 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#2F2B28] font-heading">
                تم إرسال الرابط بنجاح!
              </h3>
              <p className="text-xs text-[#5F5751] leading-relaxed">
                {recoverySuccessMsg || 'يرجى مراجعة صندوق الوارد في بريدك الإلكتروني والضغط على الرابط لإعادة تعيين كلمة المرور.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setRecoveryError('');
                }}
                className="w-full py-2.5 px-4 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[12px] font-bold text-xs"
              >
                العودة لصفحة تسجيل الدخول
              </button>
            </div>
          )}

          {/* Return to Store Link */}
          <div className="mt-6 pt-4 border-t border-[#E5D8C9] text-center">
            <button
              type="button"
              onClick={() => setActiveView('store')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8A7465] hover:text-[#2F2B28] transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى متجر ميني بازار</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
