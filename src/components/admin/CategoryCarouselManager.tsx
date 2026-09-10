import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Save,
  ArrowRightLeft,
  MousePointer,
  ChevronRight,
  Eye,
  Layers,
  Zap,
  Gauge,
  Palette,
  Check,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CategoryCarouselSettings, CategoryCardStyle, CarouselDirection } from '../../types';
import { initialCategoryCarouselSettings } from '../../data/initialData';

interface CategoryCarouselManagerProps {
  onSuccess?: () => void;
}

export const CategoryCarouselManager: React.FC<CategoryCarouselManagerProps> = ({ onSuccess }) => {
  const { storeSettings, updateStoreSettings, categories, products } = useStore();

  const currentSettings: CategoryCarouselSettings =
    storeSettings.category_carousel || initialCategoryCarouselSettings;

  const [settings, setSettings] = useState<CategoryCarouselSettings>({
    ...initialCategoryCarouselSettings,
    ...currentSettings,
  });

  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleUpdate = <K extends keyof CategoryCarouselSettings>(
    key: K,
    value: CategoryCarouselSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    updateStoreSettings({ category_carousel: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({ category_carousel: settings });
    setSavedMessage('تم حفظ وتحديث أدوات كورسيل التصنيفات بنجاح!');
    if (onSuccess) onSuccess();
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const handleRestoreDefaults = () => {
    setSettings(initialCategoryCarouselSettings);
    updateStoreSettings({ category_carousel: initialCategoryCarouselSettings });
    setSavedMessage('تمت استعادة الإعدادات الافتراضية للكورسيل.');
    if (onSuccess) onSuccess();
    setTimeout(() => setSavedMessage(null), 3500);
  };

  // Speed Presets
  const speedPresets: { label: string; value: number; icon: string }[] = [
    { label: 'هادئة فاخرة (45ث)', value: 45, icon: '🌿' },
    { label: 'متوازنة قياسية (28ث)', value: 28, icon: '✨' },
    { label: 'سريعة ونشطة (18ث)', value: 18, icon: '⚡' },
    { label: 'فائقة السرعة (10ث)', value: 10, icon: '🚀' },
  ];

  // Card Style Options
  const cardStyleOptions: {
    id: CategoryCardStyle;
    title_ar: string;
    description_ar: string;
  }[] = [
    {
      id: 'luxury',
      title_ar: 'النمط الفاخر (Luxury Warm)',
      description_ar: 'تدرج ذهبي دافئ مع حواف منحنية وظلال عميقة وتكبير سلس.',
    },
    {
      id: 'overlay',
      title_ar: 'النمط العائم (Overlay Full-Bleed)',
      description_ar: 'صورة كاملة مع تدرج داكن وعنوان عائم عليها.',
    },
    {
      id: 'circle',
      title_ar: 'النمط الدائري (Circular Stories)',
      description_ar: 'أقسام دائرية أنيقة تشبه القصص والمجموعات العصرية.',
    },
    {
      id: 'glass',
      title_ar: 'النمط الزجاجي (Glassmorphism)',
      description_ar: 'خلفية شفافة بلورية مع تأثير التعتيم وحدود ناعمة.',
    },
    {
      id: 'minimal',
      title_ar: 'النمط البسيط (Minimal Clean)',
      description_ar: 'خطوط هندسية أنيقة وحواف متباينة تلائم التصاميم الهادئة.',
    },
    {
      id: 'compact',
      title_ar: 'النمط المدمج (Compact Pill)',
      description_ar: 'بطاقات صغيرة متراصة تتيح رؤية أكبر عدد من الأقسام معاً.',
    },
  ];

  // Hover Effect Options
  const hoverEffectOptions: {
    id: 'zoom' | 'lift' | 'glow' | 'subtle';
    title_ar: string;
  }[] = [
    { id: 'zoom', title_ar: 'تكبير الصورة (Zoom)' },
    { id: 'lift', title_ar: 'رفع البطاقة للأعلى (Lift)' },
    { id: 'glow', title_ar: 'إهالة وإضاءة ذهبية (Glow)' },
    { id: 'subtle', title_ar: 'تفاعل خفيف (Subtle)' },
  ];

  return (
    <div className="bg-white p-6 sm:p-7 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#2F2B28] text-[#C6A36A] flex items-center justify-center border border-[#4A3E37]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#6F584A] font-heading flex items-center gap-2">
              <span>تخصيص كورسيل التصنيفات المتحرك (Category Carousel)</span>
              <span className="text-[10px] bg-[#F4ECE2] text-[#6F584A] px-2 py-0.5 rounded-full border border-[#D9C1A7] font-sans">
                حركة مستمرة
              </span>
            </h3>
            <p className="text-xs text-[#7C736D] mt-0.5">
              تحكم في سرعة الدوران المستمر، الاتجاه، التوقف عند التحويم، أزرار التنقل، وأنماط البطاقات الفاخرة
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-bold ${
              settings.enabled && settings.autoplay
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : settings.enabled
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {settings.enabled && settings.autoplay ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>دوران مستمر نشط</span>
              </>
            ) : settings.enabled ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600" />
                <span>كورسيل يدوي</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>شبكة ثابتة (Grid)</span>
              </>
            )}
          </span>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-[14px] bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* SECTION 1: MASTER TOGGLES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Toggle 1: Enable Carousel */}
          <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-[#2F2B28] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#8A7465]" />
                <span>تفعيل الكورسيل المتحرك</span>
              </div>
              <p className="text-[11px] text-[#7C736D] mt-1">
                عرض التصنيفات كشريط انزلاقي متصل بدلاً من الشبكة الثابتة
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleUpdate('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F2B28]"></div>
            </label>
          </div>

          {/* Toggle 2: Autoplay / Continuous Motion */}
          <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-[#2F2B28] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#C6A36A]" />
                <span>الحركة الدائرية المستمرة</span>
              </div>
              <p className="text-[11px] text-[#7C736D] mt-1">
                تدفق متواصل وتلقائي للأقسام دون انقطاع (Seamless Loop)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                disabled={!settings.enabled}
                checked={settings.autoplay}
                onChange={(e) => handleUpdate('autoplay', e.target.checked)}
                className="sr-only peer disabled:opacity-50"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F2B28]"></div>
            </label>
          </div>

          {/* Toggle 3: Pause on Hover */}
          <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-[#2F2B28] flex items-center gap-1.5">
                <MousePointer className="w-4 h-4 text-[#8A7465]" />
                <span>إيقاف الحركة عند التحويم</span>
              </div>
              <p className="text-[11px] text-[#7C736D] mt-1">
                تثبيت حركة الشريط عندما يضع الزائر الفأرة على القسم لتسهيل النقر
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                disabled={!settings.enabled || !settings.autoplay}
                checked={settings.pause_on_hover}
                onChange={(e) => handleUpdate('pause_on_hover', e.target.checked)}
                className="sr-only peer disabled:opacity-50"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F2B28]"></div>
            </label>
          </div>
        </div>

        {/* SECTION 2: SPEED & DIRECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Speed Configuration Card */}
          <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#C6A36A]" />
                <h4 className="font-bold text-[#2F2B28]">سرعة التدفق والانتقال (Speed)</h4>
              </div>
              <span className="font-mono font-bold text-xs bg-[#F4ECE2] text-[#6F584A] px-2.5 py-1 rounded-full border border-[#D9C1A7]">
                {settings.speed} ثانية للدورة
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="8"
                max="60"
                step="2"
                disabled={!settings.enabled || !settings.autoplay}
                value={settings.speed}
                onChange={(e) => handleUpdate('speed', Number(e.target.value))}
                className="w-full accent-[#2F2B28] cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-[#8A7465] font-mono">
                <span>سريع جداً (8ث)</span>
                <span>متوازن فاخر (28ث)</span>
                <span>هادئ جداً (60ث)</span>
              </div>
            </div>

            {/* Speed Presets Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {speedPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  disabled={!settings.enabled || !settings.autoplay}
                  onClick={() => handleUpdate('speed', preset.value)}
                  className={`p-2 rounded-[12px] border text-center transition-all ${
                    settings.speed === preset.value
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-xs'
                      : 'bg-white hover:bg-[#F4ECE2] text-[#5F5751] border-[#D9C1A7]'
                  }`}
                >
                  <div className="text-xs mb-0.5">{preset.icon}</div>
                  <div className="text-[10px] font-bold">{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Direction & Edge Gradient */}
          <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#8A7465]" />
              <h4 className="font-bold text-[#2F2B28]">اتجاه الحركة وتأثير التلاشي للأطراف</h4>
            </div>

            {/* Direction Radio options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!settings.enabled || !settings.autoplay}
                onClick={() => handleUpdate('direction', 'rtl')}
                className={`p-3 rounded-[14px] border text-right transition-all ${
                  settings.direction === 'rtl'
                    ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-xs'
                    : 'bg-white hover:bg-[#F4ECE2] text-[#2F2B28] border-[#D9C1A7]'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>من اليمين لليسار (RTL)</span>
                  <span>◀</span>
                </div>
                <p className={`text-[10px] mt-1 ${settings.direction === 'rtl' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                  الوضع الطبيعي والمثالي لتجربة التسوق باللغة العربية
                </p>
              </button>

              <button
                type="button"
                disabled={!settings.enabled || !settings.autoplay}
                onClick={() => handleUpdate('direction', 'ltr')}
                className={`p-3 rounded-[14px] border text-right transition-all ${
                  settings.direction === 'ltr'
                    ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-xs'
                    : 'bg-white hover:bg-[#F4ECE2] text-[#2F2B28] border-[#D9C1A7]'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>من اليسار لليمين (LTR)</span>
                  <span>▶</span>
                </div>
                <p className={`text-[10px] mt-1 ${settings.direction === 'ltr' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                  حركة عكسية تناسب الاستعراض الغربي واللاتيني
                </p>
              </button>
            </div>

            {/* Edge Gradient and Navigation Tools */}
            <div className="pt-2 border-t border-[#E5D8C9] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_gradient_fade}
                  onChange={(e) => handleUpdate('show_gradient_fade', e.target.checked)}
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <span className="text-[#5F5751] font-semibold">تأثير التلاشي الضبابي للأطراف (Edge Gradient)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_arrows}
                  onChange={(e) => handleUpdate('show_arrows', e.target.checked)}
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <span className="text-[#5F5751] font-semibold">إظهار أسهم التنقل اليدوي (السابق/التالي)</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: CARD DESIGN STYLES */}
        <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#C6A36A]" />
              <h4 className="font-bold text-[#2F2B28]">نمط وتصميم بطاقات الأقسام (Card Styles)</h4>
            </div>
            <span className="text-[11px] text-[#7C736D]">اختر النمط البصري المتناسق مع هوية متجرك</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cardStyleOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleUpdate('card_style', opt.id)}
                className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between ${
                  settings.card_style === opt.id
                    ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-md ring-2 ring-[#C6A36A]/40'
                    : 'bg-white hover:bg-[#F4ECE2] text-[#2F2B28] border-[#D9C1A7]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs">{opt.title_ar}</span>
                    {settings.card_style === opt.id && (
                      <span className="w-4 h-4 rounded-full bg-[#C6A36A] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] leading-relaxed ${settings.card_style === opt.id ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                    {opt.description_ar}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Hover Effect & Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-[#5F5751] mb-1.5 text-xs">
                تأثير التحويم على البطاقات (Hover Animation)
              </label>
              <select
                value={settings.hover_effect || 'zoom'}
                onChange={(e) => handleUpdate('hover_effect', e.target.value as any)}
                className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[12px] text-xs text-[#2F2B28] outline-none"
              >
                {hoverEffectOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title_ar}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_active_indicator !== false}
                  onChange={(e) => handleUpdate('show_active_indicator', e.target.checked)}
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <span className="text-[#5F5751] font-semibold text-xs">إظهار علامة التحديد (✓) على القسم النشط</span>
              </label>
            </div>
          </div>

          {/* Visibility Checkboxes */}
          <div className="pt-3 border-t border-[#E5D8C9] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_item_count}
                onChange={(e) => handleUpdate('show_item_count', e.target.checked)}
                className="w-4 h-4 accent-[#2F2B28]"
              />
              <span className="text-[#5F5751] font-semibold">إظهار شارة عدد القطع (مثال: 12 قطعة)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_description}
                onChange={(e) => handleUpdate('show_description', e.target.checked)}
                className="w-4 h-4 accent-[#2F2B28]"
              />
              <span className="text-[#5F5751] font-semibold">إظهار الوصف التوضيحي للتصنيف</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_view_all_button}
                onChange={(e) => handleUpdate('show_view_all_button', e.target.checked)}
                className="w-4 h-4 accent-[#2F2B28]"
              />
              <span className="text-[#5F5751] font-semibold">إظهار زر "عرض الكل" بالأعلى</span>
            </label>
          </div>
        </div>

        {/* SECTION 4: HEADER LABELS CUSTOMIZATION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC]">
          <div>
            <label className="block font-semibold text-[#5F5751] mb-1.5">
              شارة وتصنيف الهيدر (Badge Text)
            </label>
            <input
              type="text"
              value={settings.badge_text_ar || ''}
              onChange={(e) => handleUpdate('badge_text_ar', e.target.value)}
              placeholder="مثال: مجموعات مختارة بعناية"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[12px] text-xs text-[#2F2B28] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5F5751] mb-1.5">
              عنوان قسم التصنيفات (Section Heading)
            </label>
            <input
              type="text"
              value={settings.title_ar || ''}
              onChange={(e) => handleUpdate('title_ar', e.target.value)}
              placeholder="مثال: تصنيفات ميني بازار الفاخرة"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] focus:border-[#6F584A] rounded-[12px] text-xs text-[#2F2B28] outline-none"
            />
          </div>
        </div>

        {/* SECTION 5: LIVE INTERACTIVE PREVIEW */}
        <div className="p-5 rounded-[20px] bg-[#FAF6F0] border border-[#E0D0BE] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C6A36A]" />
              <h4 className="font-bold text-[#2F2B28]">معاينة حية ومباشرة لشريط الكورسيل</h4>
            </div>
            <span className="text-[10px] text-[#8A7465]">تحديث فوري بحسب الأنماط والخيارات المحددة أعلاه</span>
          </div>

          <div className="relative overflow-hidden bg-white/70 p-4 rounded-[16px] border border-[#E5D8C9]">
            {/* Subtle Gradient Overlays */}
            {settings.show_gradient_fade && (
              <>
                <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white/95 to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-white/95 to-transparent z-10 pointer-events-none" />
              </>
            )}

            <div
              className={`flex items-center gap-3 overflow-x-hidden ${
                settings.enabled && settings.autoplay
                  ? settings.direction === 'ltr'
                    ? 'category-marquee-ltr'
                    : 'category-marquee-rtl'
                  : ''
              }`}
              style={
                {
                  '--carousel-duration': `${settings.speed}s`,
                  width: settings.enabled && settings.autoplay ? 'max-content' : '100%',
                } as React.CSSProperties
              }
            >
              {[...categories, ...categories, ...categories].slice(0, 10).map((cat, idx) => {
                const isSelected = idx === 0; // Highlight first item as example preview
                const count = products.filter((p) => p.is_active && p.category_id === cat.id).length;
                
                const cardWidth =
                  settings.card_style === 'circle'
                    ? 'w-[100px]'
                    : settings.card_style === 'compact'
                    ? 'w-[120px]'
                    : settings.card_style === 'minimal'
                    ? 'w-[130px]'
                    : settings.card_style === 'overlay'
                    ? 'w-[140px]'
                    : 'w-[150px]';

                const hoverClass =
                  settings.hover_effect === 'lift'
                    ? 'hover:-translate-y-1'
                    : settings.hover_effect === 'glow'
                    ? 'hover:ring-2 hover:ring-[#C6A36A]/60'
                    : settings.hover_effect === 'subtle'
                    ? 'hover:opacity-90'
                    : 'hover:scale-[1.03]';

                const cardBaseClass = `group relative flex flex-col items-center shrink-0 transition-all text-center select-none cursor-pointer duration-300 ${hoverClass}`;

                let outerClass = cardBaseClass;
                if (settings.card_style === 'overlay') {
                  outerClass += ` aspect-[4/5] rounded-[16px] overflow-hidden border ${
                    isSelected ? 'ring-2 ring-[#C6A36A] border-[#C6A36A]' : 'border-[#E7D4BC]'
                  }`;
                } else if (settings.card_style === 'circle') {
                  outerClass += ` p-1 rounded-[14px]`;
                } else if (settings.card_style === 'glass') {
                  outerClass += ` p-2.5 rounded-[16px] backdrop-blur-md border ${
                    isSelected ? 'bg-white/95 border-[#C6A36A]' : 'bg-white/75 border-white/80'
                  }`;
                } else if (settings.card_style === 'minimal') {
                  outerClass += ` p-2 rounded-[12px] border ${
                    isSelected ? 'bg-[#F4ECE2] border-[#2F2B28]' : 'bg-white border-[#E5D8C9]'
                  }`;
                } else if (settings.card_style === 'compact') {
                  outerClass += ` p-2 rounded-[12px] border ${
                    isSelected ? 'bg-[#F4ECE2] border-[#C6A36A]' : 'bg-white border-[#E7D4BC]'
                  }`;
                } else {
                  // luxury
                  outerClass += ` p-2.5 rounded-[16px] border ${
                    isSelected ? 'bg-[#F4ECE2] border-[#C6A36A]' : 'bg-white border-[#E7D4BC]'
                  }`;
                }

                return (
                  <div key={`preview-${cat.id}-${idx}`} className={`${cardWidth} ${outerClass}`}>
                    {/* 1. OVERLAY */}
                    {settings.card_style === 'overlay' && (
                      <div className="relative w-full h-full">
                        <img
                          src={cat.image_path}
                          alt={cat.name_ar}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        {isSelected && settings.show_active_indicator !== false && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C6A36A] text-white flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </div>
                        )}
                        {settings.show_item_count && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.2 rounded-full">
                            {count}
                          </span>
                        )}
                        <div className="absolute bottom-0 inset-x-0 p-2 text-right">
                          <span className="text-[11px] font-bold text-white block truncate">
                            {cat.name_ar}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 2. CIRCLE */}
                    {settings.card_style === 'circle' && (
                      <>
                        <div
                          className={`w-16 h-16 rounded-full p-[2px] mb-1.5 relative shrink-0 ${
                            isSelected
                              ? 'bg-gradient-to-tr from-[#C6A36A] to-[#2F2B28] ring-2 ring-[#C6A36A]/50'
                              : 'bg-[#C6A36A]/40'
                          }`}
                        >
                          <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                            <img
                              src={cat.image_path}
                              alt={cat.name_ar}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          {isSelected && settings.show_active_indicator !== false && (
                            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#C6A36A] text-white flex items-center justify-center text-[9px] font-bold">
                              ✓
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#2F2B28] truncate w-full">
                          {cat.name_ar}
                        </span>
                        {settings.show_item_count && (
                          <span className="text-[8px] text-[#8A7465] mt-0.5">
                            {count} قطع
                          </span>
                        )}
                      </>
                    )}

                    {/* 3. STANDARD / GLASS / MINIMAL / COMPACT / LUXURY */}
                    {settings.card_style !== 'overlay' && settings.card_style !== 'circle' && (
                      <>
                        <div className="relative w-full aspect-1/1 rounded-[10px] overflow-hidden mb-1.5 bg-[#F4ECE2]">
                          <img
                            src={cat.image_path}
                            alt={cat.name_ar}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80" />
                          {isSelected && settings.show_active_indicator !== false && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C6A36A] text-white flex items-center justify-center text-[9px] font-bold">
                              ✓
                            </div>
                          )}
                          {settings.show_item_count && (
                            <span className="absolute bottom-1 right-1 text-[8px] font-bold text-white bg-black/50 px-1.5 py-0.2 rounded-full">
                              {count} قطع
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] font-bold truncate w-full ${
                            isSelected ? 'text-[#6F584A]' : 'text-[#2F2B28]'
                          }`}
                        >
                          {cat.name_ar}
                        </span>
                        {settings.show_description && cat.description_ar && (
                          <span className="text-[9px] text-[#7C736D] line-clamp-1 mt-0.2">
                            {cat.description_ar}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E5D8C9]">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="text-xs font-bold text-[#8A7465] hover:text-[#2F2B28] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة إعدادات الكورسيل الافتراضية</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] rounded-[14px] font-bold text-xs shadow-xs transition-all active:scale-95 border border-[#4A3E37]"
          >
            <Save className="w-4 h-4 text-[#C6A36A]" />
            <span>حفظ إعدادات كورسيل التصنيفات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
