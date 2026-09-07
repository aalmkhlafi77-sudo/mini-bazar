import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MiniBazaarLogo } from '../MiniBazaarLogo';

export const AdminLoginView: React.FC = () => {
  const {
    adminCredentials,
    loginAdmin,
    recoverAdminPassword,
    setActiveView,
  } = useStore();

  // Mode: 'login' | 'recover' | 'recover_success'
  const [mode, setMode] = useState<'login' | 'recover' | 'recover_success'>('login');

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recovery Form States
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'question' | 'pin'>('question');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  // Credentials hint toggle
  const [showCredentialsHint, setShowCredentialsHint] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = loginAdmin(username, password, rememberMe);
      if (!result.success) {
        setLoginError(result.error || 'خطأ في تسجيل الدخول');
      }
      setIsSubmitting(false);
    }, 300);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!recoveryIdentifier.trim()) {
      setRecoveryError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
      return;
    }

    if (newPassword.length < 4) {
      setRecoveryError('كلمة المرور الجديدة يجب ألا تقل عن 4 خانات.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = recoverAdminPassword({
        identifier: recoveryIdentifier,
        securityAnswer: recoveryMethod === 'question' ? securityAnswer : undefined,
        recoveryPin: recoveryMethod === 'pin' ? recoveryPin : undefined,
        newPassword,
      });

      if (result.success) {
        setMode('recover_success');
      } else {
        setRecoveryError(result.error || 'تعذر استعادة كلمة المرور');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const fillDefaultCredentials = () => {
    setUsername(adminCredentials.username || 'admin');
    setPassword('admin123');
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
            <MiniBazaarLogo variant="onDark" size="md" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6A36A]/20 border border-[#C6A36A]/40 text-[#E7D4BC] text-[11px] font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>بوابة الأمان والتحكم الإداري</span>
          </div>

          <h2 className="text-lg font-bold text-white font-heading">
            {mode === 'login' && 'تسجيل الدخول إلى لوحة التحكم'}
            {mode === 'recover' && 'استعادة وتعيين كلمة المرور'}
            {mode === 'recover_success' && 'تم استعادة كلمة المرور بنجاح'}
          </h2>
          <p className="text-xs text-[#D9C1A7] mt-1 max-w-xs mx-auto">
            {mode === 'login' && 'إدارة المنتجات، الطلبيات، والمظهر الفاخر لمتجر ميني بازار'}
            {mode === 'recover' && 'التحقق الأمني واسترداد حساب الإدارة بسهولة وأمان'}
            {mode === 'recover_success' && 'تم تحديث بياناتك واعتماد كلمة المرور الجديدة'}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3.5 rounded-[14px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-[#5F5751] mb-1.5">
                  اسم المستخدم أو البريد الإداري
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم (مثال: admin)"
                    className="w-full pl-4 pr-10 py-3 bg-[#FBF8F3] border border-[#D9C1A7] focus:border-[#6F584A] focus:bg-white rounded-[14px] text-xs text-[#2F2B28] placeholder-[#A89F91] transition-all outline-none"
                    dir="ltr"
                  />
                  <User className="w-4 h-4 text-[#8A7465] absolute right-3.5 top-1/2 -translate-y-1/2" />
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
                      setRecoveryIdentifier(username || adminCredentials.username);
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
                  <span className="text-xs text-[#5F5751]">تذكر تسجيل الدخول في هذا المتصفح</span>
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

              {/* Helper Accordion / Quick Demo Fill */}
              <div className="pt-2 border-t border-[#E5D8C9]/60">
                <button
                  type="button"
                  onClick={() => setShowCredentialsHint(!showCredentialsHint)}
                  className="w-full flex items-center justify-between text-[11px] text-[#8A7465] hover:text-[#2F2B28] py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#C6A36A]" />
                    <span>بيانات الدخول الافتراضية للنظام التجريبي</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#A89F91]">
                    {showCredentialsHint ? 'إخفاء ▲' : 'عرض ▼'}
                  </span>
                </button>

                {showCredentialsHint && (
                  <div className="mt-2 p-3 rounded-[12px] bg-[#FBF8F3] border border-[#E7D4BC] text-[11px] text-[#5F5751] space-y-2">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span>المستخدم الافتراضي: <strong className="text-[#2F2B28]">{adminCredentials.username || 'admin'}</strong></span>
                      <span>الرمز الافتراضي: <strong className="text-[#2F2B28]">admin123</strong></span>
                    </div>
                    <div className="text-[10px] text-[#8A7465] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>مشفر بتجزئة SHA-256 مع ملح عشوائي (محمي من كشف جيت هاب)</span>
                    </div>
                    <button
                      type="button"
                      onClick={fillDefaultCredentials}
                      className="w-full py-1.5 px-2 bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] rounded-[8px] font-bold text-[10px] transition-colors"
                    >
                      تعبئة تلقائية للبيانات الافتراضية
                    </button>
                  </div>
                )}
              </div>
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

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-[#5F5751] mb-1.5">
                  اسم المستخدم أو البريد الإلكتروني المسجل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="مثال: admin أو admin@minibazaar.com"
                    className="w-full pl-4 pr-10 py-2.5 bg-[#FBF8F3] border border-[#D9C1A7] focus:border-[#6F584A] focus:bg-white rounded-[12px] text-xs text-[#2F2B28] placeholder-[#A89F91] transition-all outline-none"
                    dir="ltr"
                  />
                  <User className="w-4 h-4 text-[#8A7465] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Recovery Verification Method Selection */}
              <div>
                <label className="block text-xs font-bold text-[#5F5751] mb-2">
                  طريقة التحقق الأمني:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('question')}
                    className={`p-2.5 rounded-[12px] border text-center font-bold transition-all ${
                      recoveryMethod === 'question'
                        ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                        : 'bg-[#FBF8F3] text-[#6F584A] border-[#D9C1A7] hover:bg-[#F4ECE2]'
                    }`}
                  >
                    سؤال الأمان السري
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryMethod('pin')}
                    className={`p-2.5 rounded-[12px] border text-center font-bold transition-all ${
                      recoveryMethod === 'pin'
                        ? 'bg-[#2F2B28] text-white border-[#2F2B28]'
                        : 'bg-[#FBF8F3] text-[#6F584A] border-[#D9C1A7] hover:bg-[#F4ECE2]'
                    }`}
                  >
                    رمز الأمان (PIN)
                  </button>
                </div>
              </div>

              {/* Method A: Security Question */}
              {recoveryMethod === 'question' && (
                <div className="p-3.5 rounded-[14px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-2">
                  <div className="text-[11px] font-semibold text-[#8A7465]">
                    سؤال الأمان المعتمد:
                  </div>
                  <div className="text-xs font-bold text-[#2F2B28]">
                    {adminCredentials.security_question || 'ما هو اسم المتجر بالعربية؟'}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5F5751] mt-2 mb-1">
                      إجابتك على سؤال الأمان
                    </label>
                    <input
                      type="text"
                      required
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder="أدخل الإجابة الصحيحة (افتراضياً: ميني بازار)"
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Method B: Recovery PIN */}
              {recoveryMethod === 'pin' && (
                <div className="p-3.5 rounded-[14px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-2">
                  <label className="block text-[11px] font-semibold text-[#5F5751] mb-1">
                    رمز الأمان السري للاسترداد (PIN)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={recoveryPin}
                      onChange={(e) => setRecoveryPin(e.target.value)}
                      placeholder="أدخل الرمز السري (افتراضياً: 2026)"
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] font-mono outline-none"
                      dir="ltr"
                    />
                    <KeyRound className="w-4 h-4 text-[#8A7465] absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* New Password & Confirm Password */}
              <div className="space-y-3 pt-2 border-t border-[#E5D8C9]">
                <div>
                  <label className="block text-xs font-bold text-[#5F5751] mb-1">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="كلمة مرور جديدة (4 خانات فأكثر)"
                      className="w-full pl-11 pr-3 py-2.5 bg-[#FBF8F3] border border-[#D9C1A7] focus:border-[#6F584A] focus:bg-white rounded-[12px] text-xs text-[#2F2B28] outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? 'إخفاء' : 'إظهار'}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8A7465] hover:text-[#2F2B28]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5F5751] mb-1">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="إعادة كتابة كلمة المرور"
                      className="w-full pl-11 pr-3 py-2.5 bg-[#FBF8F3] border border-[#D9C1A7] focus:border-[#6F584A] focus:bg-white rounded-[12px] text-xs text-[#2F2B28] outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'إخفاء' : 'إظهار'}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8A7465] hover:text-[#2F2B28]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
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
                      <span>حفظ واستعادة الحساب</span>
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
                تم استعادة كلمة المرور بنجاح!
              </h3>
              <p className="text-xs text-[#5F5751]">
                تم تحديث كلمة المرور لحساب الإدارة وتسجيل دخولك تلقائياً بنجاح. يمكنك الآن الانتقال مباشرة للوحة التحكم.
              </p>
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
