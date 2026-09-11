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
  Mail,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminSecuritySettingsProps {
  onSuccess?: () => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({ onSuccess }) => {
  const {
    adminUser,
    adminCredentials,
    updateAdminPassword,
    sendAdminPasswordReset,
    logoutAdmin,
  } = useStore();

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Reset Email State
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetEmailMessage, setResetEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeEmail = adminUser?.email || adminCredentials.email || 'admin@minibazaar.com';

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'كلمة المرور الجديدة يجب ألا تقل عن 6 خانات وفق معايير Firebase.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'كلمتا المرور الجديدتان غير متطابقتين.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await updateAdminPassword(currentPassword, newPassword);
      if (result.success) {
        setPasswordMessage({
          type: 'success',
          text: 'تم تحديث كلمة المرور في Firebase Authentication بنجاح! تم اعتماد كلمة المرور الجديدة في كافة الجلسات.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onSuccess) onSuccess();
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'تعذر تحديث كلمة المرور.' });
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'حدث خطأ أثناء تحديث كلمة المرور.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Send Password Reset Email
  const handleSendResetEmail = async () => {
    setResetEmailMessage(null);
    setIsSendingReset(true);
    try {
      const result = await sendAdminPasswordReset(activeEmail);
      if (result.success) {
        setResetEmailMessage({
          type: 'success',
          text: `تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد: ${activeEmail}`,
        });
      } else {
        setResetEmailMessage({ type: 'error', text: result.error || 'تعذر إرسال الرابط.' });
      }
    } catch (err: any) {
      setResetEmailMessage({ type: 'error', text: err?.message || 'حدث خطأ غير متوقع.' });
    } finally {
      setIsSendingReset(false);
    }
  };

  // Password Strength helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'غير مدخلة', color: 'bg-gray-200 text-gray-500' };
    if (pass.length < 6) return { score: 1, text: 'قصيرة جداً (أقل من 6)', color: 'bg-red-100 text-red-700' };
    if (pass.length < 9) return { score: 2, text: 'جيدة', color: 'bg-amber-100 text-amber-700' };
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
              <span>أمان حساب الإدارة (Firebase Authentication)</span>
            </h3>
            <p className="text-xs text-[#7C736D] mt-0.5">
              إدارة كلمة المرور المركزية وحماية حساب المشرف عبر السحابة
            </p>
          </div>
        </div>

        {/* Current Admin Badge & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-[12px] bg-[#FBF8F3] border border-[#D9C1A7] text-xs font-semibold text-[#2F2B28] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#8A7465]" />
            <span>حساب المشرف: <strong className="font-mono text-[#6F584A]">{activeEmail}</strong></span>
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

      {/* Cloud Auth Architecture Banner */}
      <div className="p-4 rounded-[18px] bg-[#FAF6F0] border border-[#E0D0BE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#2F2B28] flex items-center gap-2">
              <span>المصادقة السحابية الحصرية (Firebase Cloud Auth)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                نشط ومعتمد
              </span>
            </div>
            <p className="text-[11px] text-[#7C736D] mt-0.5">
              يتم التحقق من كلمات المرور وتشفيرها حصراً عبر Firebase Authentication السحابي، بدون أي تخزين محلي أو مقارنات جانبية.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* BLOCK 1: CHANGE PASSWORD */}
        <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8A7465]" />
                <h4 className="text-xs font-bold text-[#2F2B28]">تغيير كلمة المرور في Firebase Auth</h4>
              </div>
              {newPassword && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${strength.color}`}>
                  {strength.text}
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
                  كلمة المرور الحالية (للتحقق الأمني)
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
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
                  كلمة المرور الجديدة (6 خانات فأكثر)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="كلمة مرور جديدة (6 خانات فأكثر)"
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
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[12px] font-bold text-xs shadow-sm border border-[#4A3E37] transition-all disabled:opacity-50"
              >
                {isUpdatingPassword ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C6A36A]" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-[#C6A36A]" />
                    <span>حفظ وتحديث كلمة المرور في السحابة</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-[#E5D8C9] text-[11px] text-[#7C736D]">
            ملاحظة: بمجرد الحفظ، يتم تحديث كلمة المرور مباشرة في Firebase، ولن تعمل كلمة المرور القديمة مطلقاً.
          </div>
        </div>

        {/* BLOCK 2: RESET PASSWORD VIA EMAIL */}
        <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-4 h-4 text-[#8A7465]" />
              <h4 className="text-xs font-bold text-[#2F2B28]">استعادة كلمة المرور عبر البريد الإلكتروني</h4>
            </div>

            <p className="text-[11px] text-[#7C736D] leading-relaxed mb-4">
              يمكنك إرسال رسالة بريد إلكتروني رسمية إلى حساب المشرف تحتوي على رابط مباشر لتعيين كلمة مرور جديدة لحسابك.
            </p>

            {resetEmailMessage && (
              <div
                className={`p-3 rounded-[12px] mb-3 flex items-center gap-2 ${
                  resetEmailMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {resetEmailMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{resetEmailMessage.text}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">
                  البريد الإلكتروني المستلم
                </label>
                <input
                  type="email"
                  disabled
                  value={activeEmail}
                  className="w-full p-2.5 bg-gray-100 border border-gray-300 rounded-[10px] text-gray-600 font-mono text-xs cursor-not-allowed"
                  dir="ltr"
                />
              </div>

              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={isSendingReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[12px] font-bold text-xs shadow-sm border border-[#4A3E37] transition-all disabled:opacity-50"
              >
                {isSendingReset ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C6A36A]" />
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-[#C6A36A]" />
                    <span>إرسال رابط إعادة التعيين إلى بريدي</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5D8C9] text-[11px] text-[#7C736D]">
            الرابط المرسل صالح للاستخدام من قِبل المشرف فقط ويتم توثيقه وتأمينه مباشرة بواسطة Firebase Authentication.
          </div>
        </div>
      </div>
    </div>
  );
};
