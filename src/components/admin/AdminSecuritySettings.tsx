import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Mail,
  Shield,
  Clock,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminSecuritySettingsProps {
  onSuccess?: () => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({ onSuccess }) => {
  const {
    adminCredentials,
    updateAdminUsername,
    updateAdminPassword,
    updateAdminSecurity,
    resetAdminCredentialsToDefault,
    logoutAdmin,
  } = useStore();

  // Username Change Form State
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Recovery Settings State
  const [securityQuestion, setSecurityQuestion] = useState(adminCredentials.security_question || 'ما هو اسم المتجر بالعربية؟');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState(adminCredentials.recovery_email || 'admin@minibazaar.com');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle Username Update
  const handleUpdateUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMessage(null);

    const result = updateAdminUsername(newUsername);
    if (result.success) {
      setUsernameMessage({ type: 'success', text: 'تم تحديث اسم المستخدم بنجاح.' });
      setNewUsername('');
      if (onSuccess) onSuccess();
      setTimeout(() => setUsernameMessage(null), 4000);
    } else {
      setUsernameMessage({ type: 'error', text: result.error || 'تعذر تحديث اسم المستخدم.' });
    }
  };

  // Handle Password Update
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'كلمتا المرور الجديدتان غير متطابقتين.' });
      return;
    }

    const result = updateAdminPassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordMessage({ type: 'success', text: 'تم تحديث كلمة المرور بنجاح.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess();
      setTimeout(() => setPasswordMessage(null), 4000);
    } else {
      setPasswordMessage({ type: 'error', text: result.error || 'تعذر تحديث كلمة المرور.' });
    }
  };

  // Handle Security Recovery Updates
  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    const updatePayload: {
      security_question?: string;
      security_answer?: string;
      recovery_email?: string;
      recovery_pin?: string;
    } = {
      security_question: securityQuestion,
      recovery_email: recoveryEmail,
    };

    if (securityAnswer.trim()) {
      updatePayload.security_answer = securityAnswer.trim();
    }
    if (recoveryPin.trim()) {
      updatePayload.recovery_pin = recoveryPin.trim();
    }

    const result = updateAdminSecurity(updatePayload);

    if (result.success) {
      setSecurityMessage({ type: 'success', text: 'تم تشفير وتحديث بيانات الاسترداد وسؤال الأمان بنجاح.' });
      setSecurityAnswer('');
      setRecoveryPin('');
      if (onSuccess) onSuccess();
      setTimeout(() => setSecurityMessage(null), 4000);
    } else {
      setSecurityMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ بيانات الاسترداد.' });
    }
  };

  // Password Strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'غير مدخلة', color: 'bg-gray-200 text-gray-500' };
    if (pass.length < 4) return { score: 1, text: 'قصيرة جداً', color: 'bg-red-100 text-red-700' };
    if (pass.length < 7) return { score: 2, text: 'متوسطة', color: 'bg-amber-100 text-amber-700' };
    return { score: 3, text: 'قوية وممتازة', color: 'bg-green-100 text-green-700' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="bg-white p-6 sm:p-7 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6 text-right">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#2F2B28] text-[#C6A36A] flex items-center justify-center border border-[#4A3E37]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#6F584A] font-heading flex items-center gap-2">
              <span>أمان الحساب وتسجيل الدخول (المستخدم وكلمة المرور)</span>
            </h3>
            <p className="text-xs text-[#7C736D] mt-0.5">
              تخصيص بيانات الدخول، تغيير كلمة المرور، وضبط إعدادات استعادة الحساب
            </p>
          </div>
        </div>

        {/* Current Admin Badge & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-[12px] bg-[#FBF8F3] border border-[#D9C1A7] text-xs font-semibold text-[#2F2B28] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#8A7465]" />
            <span>المستخدم الحالي: <strong className="font-mono text-[#6F584A]">{adminCredentials.username}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => {
              logoutAdmin();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all active:scale-95 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* GitHub & Cryptographic Security Architecture Banner */}
      <div className="p-4 rounded-[18px] bg-[#FAF6F0] border border-[#E0D0BE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#2F2B28] flex items-center gap-2">
              <span>حماية الأمان والتشفير (GitHub Safe & Salted SHA-256)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                محمي من التسريب
              </span>
            </div>
            <p className="text-[11px] text-[#7C736D] mt-0.5">
              كلمات المرور وبيانات الاسترداد مشفرة بتجزئة غير قابلة للعكس مع ملح عشوائي (Salted SHA-256)، وملف <code className="font-mono text-[#6F584A]">.gitignore</code> يحجب كافة ملفات البيئة والمفاتيح السرية تلقائياً.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* BLOCK 1: CHANGE USERNAME */}
        <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#8A7465]" />
              <h4 className="text-xs font-bold text-[#2F2B28]">تغيير اسم المستخدم (Username)</h4>
            </div>

            {usernameMessage && (
              <div
                className={`p-3 rounded-[12px] mb-3 flex items-center gap-2 ${
                  usernameMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {usernameMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{usernameMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUsername} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">
                  اسم المستخدم الحالي
                </label>
                <input
                  type="text"
                  disabled
                  value={adminCredentials.username}
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-[10px] text-gray-600 font-mono text-xs cursor-not-allowed"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">
                  اسم المستخدم الجديد
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم الجديد (3 أحرف على الأقل)"
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] outline-none"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={!newUsername.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[12px] font-bold text-xs shadow-sm border border-[#4A3E37] transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-[#C6A36A]" />
                <span>حفظ اسم المستخدم الجديد</span>
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-[#E5D8C9] text-[11px] text-[#7C736D]">
            ملاحظة: سيتم استخدام اسم المستخدم الجديد في كافة عمليات تسجيل الدخول القادمة.
          </div>
        </div>

        {/* BLOCK 2: CHANGE PASSWORD */}
        <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8A7465]" />
                <h4 className="text-xs font-bold text-[#2F2B28]">تغيير كلمة المرور (Password)</h4>
              </div>
              {newPassword && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${strength.color}`}>
                  قوة الرمز: {strength.text}
                </span>
              )}
            </div>

            {passwordMessage && (
              <div
                className={`p-3 rounded-[12px] mb-3 flex items-center gap-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              {/* Current Password with Show/Hide Toggle */}
              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">
                  كلمة المرور الحالية
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية للتأكيد"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    title={showCurrentPassword ? 'إخفاء' : 'إظهار كلمة المرور'}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A7465] hover:text-[#2F2B28]"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password with Show/Hide Toggle */}
              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="كلمة مرور جديدة (4 خانات فأكثر)"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    title={showNewPassword ? 'إخفاء' : 'إظهار كلمة المرور'}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A7465] hover:text-[#2F2B28]"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password with Show/Hide Toggle */}
              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="إعادة كتابة كلمة المرور الجديدة"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] outline-none"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'إخفاء' : 'إظهار كلمة المرور'}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A7465] hover:text-[#2F2B28]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!currentPassword || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[12px] font-bold text-xs shadow-sm border border-[#4A3E37] transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-[#C6A36A]" />
                <span>حفظ وتحديث كلمة المرور</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* BLOCK 3: SECURITY QUESTIONS & RECOVERY CREDENTIALS */}
      <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#8A7465]" />
          <h4 className="text-xs font-bold text-[#2F2B28]">
            بيانات استرداد الحساب وسؤال الأمان (Recovery Settings)
          </h4>
        </div>

        <p className="text-[11px] text-[#7C736D]">
          تُستخدم هذه البيانات للتحقق من هويتك واستعادة كلمة المرور في حال نسيانها دون الحاجة لتدخل فني.
        </p>

        {securityMessage && (
          <div
            className={`p-3 rounded-[12px] flex items-center gap-2 ${
              securityMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{securityMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateSecurity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">
              سؤال الأمان السري
            </label>
            <input
              type="text"
              required
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              placeholder="مثال: ما هو اسم المتجر بالعربية؟"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">
              إجابة سؤال الأمان الجديدة (اختياري)
            </label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              placeholder="اتركه فارغاً للإبقاء على الإجابة الحالية"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">
              رمز الأمان للاسترداد (PIN) الجديد
            </label>
            <input
              type="text"
              value={recoveryPin}
              onChange={(e) => setRecoveryPin(e.target.value)}
              placeholder="اتركه فارغاً للإبقاء على الرمز الحالي"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] font-mono outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">
              البريد الإلكتروني للاسترداد
            </label>
            <input
              type="email"
              required
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="admin@minibazaar.com"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[10px] text-xs text-[#2F2B28] font-mono outline-none"
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2 border-t border-[#E5D8C9]">
            <button
              type="button"
              onClick={() => {
                resetAdminCredentialsToDefault();
                setSecurityQuestion('ما هو اسم المتجر بالعربية؟');
                setSecurityAnswer('');
                setRecoveryEmail('admin@minibazaar.com');
                setRecoveryPin('');
                setSecurityMessage({ type: 'success', text: 'تمت استعادة بيانات الأمان الافتراضية المصنعية بنجاح.' });
                if (onSuccess) onSuccess();
                setTimeout(() => setSecurityMessage(null), 4000);
              }}
              className="text-[11px] font-bold text-[#8A7465] hover:text-red-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة بيانات الأمان الافتراضية المصنعية</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[12px] font-bold text-xs border border-[#4A3E37]"
            >
              <Save className="w-3.5 h-3.5 text-[#C6A36A]" />
              <span>حفظ إعدادات الاسترداد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
