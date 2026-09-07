import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CommunicationsManager: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();

  const [formData, setFormData] = useState({
    whatsapp_number: storeSettings.whatsapp_number || '+966500000000',
    whatsapp_default_message:
      storeSettings.whatsapp_default_message ||
      'مرحباً ميني بازار، أود الاستفسار عن المقتنيات المتوفرة والطلب.',
    whatsapp_floating_badge_text:
      storeSettings.whatsapp_floating_badge_text || 'متصلون لمساعدتك',
    whatsapp_show_floating_badge:
      storeSettings.whatsapp_show_floating_badge !== false,
    whatsapp_hover_label:
      storeSettings.whatsapp_hover_label || 'واتساب ميني بازار',
    phone_number: storeSettings.phone_number || '+966500000000',
    support_email: storeSettings.support_email || 'concierge@minibazaar.store',
    boutique_address_ar:
      storeSettings.boutique_address_ar ||
      'المملكة العربية السعودية — الرياض، شارع التحلية الفاخر',
    service_hours_ar:
      storeSettings.service_hours_ar || 'يومياً: 9:00 صباحاً – 11:30 مساءً',
    footer_verification_text_ar:
      storeSettings.footer_verification_text_ar ||
      'متجر موثق في المركز السعودي للأعمال ومعروف برقم 392019',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              إدارة أدوات الاتصال، الواتساب، والبيانات الرسمية
            </h3>
          </div>
          <p className="text-xs text-[#7C736D] mt-1">
            تحكمي الكامل بأرقام الواتساب، نصوص الرسائل التلقائية، الزر العائم، الهاتف، الإيميل والعنوان
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-right">
        {/* Section 1: WhatsApp Configuration */}
        <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2F2B28]">
            <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span>إعدادات وتخصيص واتساب والزر العائم</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                رقم واتساب المعتمد للطلبات والدعم *
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={formData.whatsapp_number}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_number: e.target.value })
                }
                placeholder="+966500000000"
                className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] font-mono"
              />
              <span className="text-[10px] text-[#8A7465] mt-1 block">
                الصيغة الدولية الموصى بها (مثال: +966501234567)
              </span>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                نص التلميح للزر العائم (Tooltip / Hover)
              </label>
              <input
                type="text"
                value={formData.whatsapp_hover_label}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_hover_label: e.target.value })
                }
                placeholder="مثال: تواصل مع خدمة العملاء"
                className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                الرسالة التلقائية المسبقة عند بدء المحادثة
              </label>
              <textarea
                rows={2}
                value={formData.whatsapp_default_message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp_default_message: e.target.value,
                  })
                }
                placeholder="الرسالة التي ستظهر للعميل تلقائياً في خانة الكتابة عند فتح الواتساب"
                className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                النص المصاحب في الشارة العائمة
              </label>
              <input
                type="text"
                value={formData.whatsapp_floating_badge_text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp_floating_badge_text: e.target.value,
                  })
                }
                placeholder="مثال: متصلون لمساعدتك"
                className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="showFloatingBadge"
                checked={formData.whatsapp_show_floating_badge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsapp_show_floating_badge: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#2F2B28]"
              />
              <label htmlFor="showFloatingBadge" className="font-semibold text-[#2F2B28]">
                إظهار الشارة النصية الجانبية للزر العائم على الشاشات الكبيرة
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Direct Phone & Official Support Email */}
        <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2F2B28]">
            <div className="w-6 h-6 rounded-full bg-[#C6A36A]/20 flex items-center justify-center text-[#6F584A]">
              <Phone className="w-4 h-4 text-[#C6A36A]" />
            </div>
            <span>رقم الاتصال المباشر والبريد الإلكتروني</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                رقم الاتصال الهاتفي المباشر
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  placeholder="+966500000000"
                  className="w-full p-2.5 pl-8 bg-white border border-[#D9C1A7] rounded-[10px] font-mono"
                />
                <Phone className="w-3.5 h-3.5 text-[#8A7465] absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                البريد الإلكتروني لخدمة العملاء والدعم
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  value={formData.support_email}
                  onChange={(e) =>
                    setFormData({ ...formData, support_email: e.target.value })
                  }
                  placeholder="concierge@minibazaar.store"
                  className="w-full p-2.5 pl-8 bg-white border border-[#D9C1A7] rounded-[10px] font-mono"
                />
                <Mail className="w-3.5 h-3.5 text-[#8A7465] absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                ساعات العمل وخدمة الكونسيرج
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.service_hours_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, service_hours_ar: e.target.value })
                  }
                  placeholder="يومياً: 9:00 صباحاً – 11:30 مساءً"
                  className="w-full p-2.5 pl-8 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
                <Clock className="w-3.5 h-3.5 text-[#8A7465] absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                نص توثيق المتجر والترخيص
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.footer_verification_text_ar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer_verification_text_ar: e.target.value,
                    })
                  }
                  placeholder="متجر موثق في المركز السعودي للأعمال..."
                  className="w-full p-2.5 pl-8 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-[#8A7465] absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                العنوان والمقر الجغرافي للفرع أو البوتيك
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.boutique_address_ar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      boutique_address_ar: e.target.value,
                    })
                  }
                  placeholder="المملكة العربية السعودية — الرياض، شارع التحلية..."
                  className="w-full p-2.5 pl-8 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
                <MapPin className="w-3.5 h-3.5 text-[#8A7465] absolute left-3 top-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold border border-[#4A3E37] shadow-xs transition-all"
          >
            <Save className="w-4 h-4 text-[#C6A36A]" />
            <span>حفظ وتطبيق بيانات الاتصال والواتساب</span>
          </button>
        </div>
      </form>
    </div>
  );
};
