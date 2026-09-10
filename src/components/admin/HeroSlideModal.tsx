import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Layout,
  Image as ImageIcon,
  MoveHorizontal,
  MoveVertical,
  Sliders,
  Smartphone,
  Monitor,
  Link2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { HeroSlide } from '../../types';
import { ImageUploader } from '../ImageUploader';
import { useStore } from '../../context/StoreContext';
import { imageUploadService } from '../../services/imageUploadService';

interface HeroSlideModalProps {
  slide: HeroSlide;
  onSave: (updatedSlide: HeroSlide) => void;
  onClose: () => void;
}

export const HeroSlideModal: React.FC<HeroSlideModalProps> = ({
  slide: initialSlide,
  onSave,
  onClose,
}) => {
  const { categories, products } = useStore();

  const [slide, setSlide] = useState<HeroSlide>({
    ...initialSlide,
    layout_type: initialSlide.layout_type || (initialSlide.background_image ? 'full_background' : 'split'),
    overlay_opacity: initialSlide.overlay_opacity !== undefined ? initialSlide.overlay_opacity : 30,
    background_blur: Boolean(initialSlide.background_blur),
    image_fit: initialSlide.image_fit || 'contain',
    image_position: initialSlide.image_position || 'top',
    desktop_height: initialSlide.desktop_height || 'cinematic',
    particles_effect: initialSlide.particles_effect || 'none',
    particles_density: initialSlide.particles_density || 'medium',
    particles_speed: initialSlide.particles_speed || 'normal',
    primary_button_url: initialSlide.primary_button_url || '#products-section',
    secondary_button_url: initialSlide.secondary_button_url || '',
  });

  // Helper to determine CTA type
  const getCtaType = (url?: string): 'category' | 'product' | 'anchor' | 'external' => {
    if (!url) return 'anchor';
    if (url.startsWith('cat:') || url.startsWith('category:')) return 'category';
    if (url.startsWith('prod:') || url.startsWith('product:')) return 'product';
    if (url.startsWith('http://') || url.startsWith('https://')) return 'external';
    return 'anchor';
  };

  const [primaryType, setPrimaryType] = useState<'category' | 'product' | 'anchor' | 'external'>(
    getCtaType(initialSlide.primary_button_url)
  );
  const [secondaryType, setSecondaryType] = useState<'category' | 'product' | 'anchor' | 'external'>(
    getCtaType(initialSlide.secondary_button_url)
  );
  const [slideStorageNotice, setSlideStorageNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSlideStorageNotice(null);

    // Strict Guard: Prevent saving hero slide if images are un-uploaded local previews
    const slideImages = [slide.desktop_image, slide.mobile_image, slide.background_image];
    const validation = imageUploadService.validateRecordImages(slideImages);
    if (!validation.canSave) {
      setSlideStorageNotice(
        validation.message || 'تم اختيار الصورة ومعاينتها، لكن يلزم إعداد خدمة التخزين قبل الحفظ النهائي'
      );
      return;
    }

    onSave(slide);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-[28px] max-w-4xl w-full text-right border border-[#E5D8C9] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5D8C9] bg-[#FBF8F3] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C6A36A]" />
              <h3 className="text-base sm:text-lg font-bold text-[#2F2B28] font-heading">
                إعدادات وتخصيص شريحة الهيرو وخلفيتها
              </h3>
            </div>
            <p className="text-xs text-[#7C736D] mt-0.5">
              تخصيص نمط العرض، صور الجوال وسطح المكتب المستقلة، روابط الإجراء والتنقل، والتموضع
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#F4ECE2] text-[#6F584A] border border-[#E7D4BC] flex items-center justify-center transition-transform active:scale-95 shadow-2xs cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-xs">
          <form id="hero-slide-form" onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Layout Type Selection */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#C6A36A]" />
                  <span>نمط عرض الشريحة (Layout Style)</span>
                </h4>
                <span className="text-[11px] text-[#7C736D] font-medium">
                  اختر الهيكل البصري المناسب لعرض محتوى الشريحة
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Full Background */}
                <button
                  type="button"
                  onClick={() => setSlide({ ...slide, layout_type: 'full_background' })}
                  className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                    slide.layout_type === 'full_background'
                      ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                      : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">خلفية بالحجم الكامل</span>
                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                      {slide.layout_type === 'full_background' && (
                        <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                      )}
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    slide.layout_type === 'full_background' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                  }`}>
                    الصورة تمتد على كامل العرض والارتفاع مع نصوص مدمجة فوقها مباشرة بتأثير سينمائي.
                  </p>
                </button>

                {/* Split Card */}
                <button
                  type="button"
                  onClick={() => setSlide({ ...slide, layout_type: 'split' })}
                  className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                    slide.layout_type === 'split'
                      ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                      : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">شريحة مقسمة (Split Card)</span>
                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                      {slide.layout_type === 'split' && (
                        <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                      )}
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    slide.layout_type === 'split' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                  }`}>
                    نص وعنوان مميز في اليمين، وبطاقة صورة المنتج المستقلة في اليسار.
                  </p>
                </button>

                {/* Full Width Horizontal Banner */}
                <button
                  type="button"
                  onClick={() => setSlide({ ...slide, layout_type: 'full_width_banner' })}
                  className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                    slide.layout_type === 'full_width_banner'
                      ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                      : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">بانر أفقي بعرض كامل</span>
                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                      {slide.layout_type === 'full_width_banner' && (
                        <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                      )}
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${
                    slide.layout_type === 'full_width_banner' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                  }`}>
                    بانر بانورامي عريض يمتد بعرض الشاشة مع شريط سفلي متناسق للعنوان وزر الشراء.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Independent Images for Desktop & Mobile */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C6A36A]" />
                  <span>صور الهيرو المستقلة (سطح المكتب والجوال)</span>
                </h4>
                <span className="text-[11px] text-[#C6A36A] font-semibold">
                  دعم صور منفصلة لمنع القص في شاشات الجوال
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Desktop Image */}
                <div className="bg-white p-4 rounded-[16px] border border-[#E7D4BC] min-w-0 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F2B28]">
                    <Monitor className="w-4 h-4 text-[#C6A36A]" />
                    <span>صورة العرض لسطح المكتب (Desktop)</span>
                  </div>
                  <ImageUploader
                    value={slide.desktop_image}
                    onChange={(url) => setSlide((prev) => ({ ...prev, desktop_image: url }))}
                    label="صورة الشاشات الكبيرة والعريضة"
                    aspectRatioHint="أبعاد عريضة مستحبة: 16:9 أو 4:3 أو 1200x600"
                    maxDimension={1600}
                    folder="hero"
                    imageFit={slide.image_fit || 'contain'}
                    onImageFitChange={(fit) => setSlide((prev) => ({ ...prev, image_fit: fit }))}
                  />
                </div>

                {/* Mobile Image */}
                <div className="bg-white p-4 rounded-[16px] border border-[#E7D4BC] min-w-0 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F2B28]">
                    <Smartphone className="w-4 h-4 text-[#C6A36A]" />
                    <span>صورة مخصصة للجوال (Mobile Image - اختياري)</span>
                  </div>
                  <ImageUploader
                    value={slide.mobile_image || ''}
                    onChange={(url) => setSlide((prev) => ({ ...prev, mobile_image: url }))}
                    label="تظهر فقط لمستخدمي الهواتف الذكية"
                    aspectRatioHint="أبعاد مربعة أو رأسية ملائمة لشاشات الجوال (1:1 أو 4:5)"
                    maxDimension={1000}
                    folder="hero"
                    imageFit={slide.image_fit || 'contain'}
                    onImageFitChange={(fit) => setSlide((prev) => ({ ...prev, image_fit: fit }))}
                  />
                </div>
              </div>

              {/* Background Backdrop Image */}
              <div className="bg-white p-4 rounded-[16px] border border-[#E7D4BC] min-w-0 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F2B28]">
                  <Sparkles className="w-4 h-4 text-[#C6A36A]" />
                  <span>صورة الخلفية الإضافية (Background Wallpaper - اختياري)</span>
                </div>
                <ImageUploader
                  value={slide.background_image || ''}
                  onChange={(url) => setSlide((prev) => ({ ...prev, background_image: url }))}
                  label="خلفية سينمائية تظهر تحت المحتوى"
                  aspectRatioHint="صورة بانورامية 16:9 بدقة فائقة"
                  maxDimension={1800}
                  folder="hero"
                />
              </div>

              {/* 3. Image Fit Options */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <MoveHorizontal className="w-4 h-4 text-[#C6A36A]" />
                  <label className="font-bold text-xs sm:text-sm text-[#2F2B28]">
                    طريقة احتواء وعرض الصورة (Image Fit):
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Contain */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_fit: 'contain' })}
                    className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                      (slide.image_fit || 'contain') === 'contain'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">احتواء كامل بدون قص (Contain)</span>
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                        {(slide.image_fit || 'contain') === 'contain' && (
                          <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                        )}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${
                      (slide.image_fit || 'contain') === 'contain' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                    }`}>
                      تظهر الصورة بالكامل بجميع أطرافها وتفاصيلها دون أن تُقص أو تختفي أجزاؤها.
                    </p>
                  </button>

                  {/* Cover */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_fit: 'cover' })}
                    className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                      slide.image_fit === 'cover'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">تمدد يملأ الإطار (Cover)</span>
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                        {slide.image_fit === 'cover' && (
                          <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                        )}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${
                      slide.image_fit === 'cover' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                    }`}>
                      تتمدد الصورة لتملأ كامل المساحة الإطارية للهيرو من الحافة إلى الحافة.
                    </p>
                  </button>

                  {/* Full Width */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_fit: 'full_width' })}
                    className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                      slide.image_fit === 'full_width'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">عرض أفقي كامل (Full Width)</span>
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                        {slide.image_fit === 'full_width' && (
                          <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                        )}
                      </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${
                      slide.image_fit === 'full_width' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                    }`}>
                      تتمدد الصورة أفقياً بعرض 100% بدون أي تقييد للحواف لتكون شريحة بانورامية كاملة.
                    </p>
                  </button>
                </div>
              </div>

              {/* 4. Focal Position (Top, Center, Bottom) */}
              <div className="pt-2 border-t border-[#E5D8C9]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <MoveVertical className="w-4 h-4 text-[#C6A36A]" />
                    <label className="font-bold text-xs sm:text-sm text-[#2F2B28]">
                      نقطة تركيز ومحاذاة الصورة (Image Position):
                    </label>
                  </div>
                  <span className="text-[11px] text-[#8A7465] bg-[#F4ECE2] px-2.5 py-0.5 rounded-full font-medium">
                    موصى به: أعلى لحماية الرؤوس
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'top', label: 'أعلى (Top)', desc: 'يثبت أعلى الصورة ليظهر النص العلوي والرأس دون قص' },
                    { id: 'center', label: 'وسط (Center)', desc: 'توسيط متوازن في المنتصف تماماً' },
                    { id: 'bottom', label: 'أسفل (Bottom)', desc: 'يثبت الجزء السفلي من الصورة داخل الإطار' },
                  ].map((pos) => {
                    const isSelected = (slide.image_position || 'top') === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setSlide({ ...slide, image_position: pos.id as any })}
                        className={`p-3 rounded-[14px] border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-sm'
                            : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{pos.label}</div>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                            {pos.desc}
                          </p>
                        </div>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#C6A36A] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Texts & Titles */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
              <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C6A36A]" />
                <span>العناوين والنصوص</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-[#2F2B28]">العنوان الرئيسي</label>
                  <input
                    type="text"
                    required
                    value={slide.title_ar}
                    onChange={(e) => setSlide({ ...slide, title_ar: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[12px] text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">لون العنوان</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.title_color || '#2F2B28'}
                      onChange={(e) => setSlide({ ...slide, title_color: e.target.value })}
                      className="w-10 h-10 p-0.5 rounded-[10px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.title_color || '#2F2B28'}
                      onChange={(e) => setSlide({ ...slide, title_color: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-[#2F2B28]">الوصف التوضيحي</label>
                  <textarea
                    rows={2}
                    value={slide.description_ar}
                    onChange={(e) => setSlide({ ...slide, description_ar: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[12px] text-xs focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">لون الوصف</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.description_color || '#5F5751'}
                      onChange={(e) => setSlide({ ...slide, description_color: e.target.value })}
                      className="w-10 h-10 p-0.5 rounded-[10px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.description_color || '#5F5751'}
                      onChange={(e) => setSlide({ ...slide, description_color: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Badge settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E5D8C9]">
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">نص الشارة العلوية (Badge)</label>
                  <input
                    type="text"
                    value={slide.badge_ar || ''}
                    onChange={(e) => setSlide({ ...slide, badge_ar: e.target.value })}
                    placeholder="مثال: وصول جديد، عرض خاص"
                    className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[12px] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">خلفية الشارة</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.badge_bg || '#F4ECE2'}
                      onChange={(e) => setSlide({ ...slide, badge_bg: e.target.value })}
                      className="w-10 h-10 p-0.5 rounded-[10px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.badge_bg || '#F4ECE2'}
                      onChange={(e) => setSlide({ ...slide, badge_bg: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs font-mono text-left"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">لون نص الشارة</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.badge_color || '#8A7465'}
                      onChange={(e) => setSlide({ ...slide, badge_color: e.target.value })}
                      className="w-10 h-10 p-0.5 rounded-[10px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.badge_color || '#8A7465'}
                      onChange={(e) => setSlide({ ...slide, badge_color: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs font-mono text-left"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Action Links Customization (Primary & Secondary CTA) */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#C6A36A]" />
                  <span>روابط الإجراء المخصصة (Action Links)</span>
                </h4>
                <span className="text-[11px] text-[#7C736D] font-medium">
                  ربط مباشر بمنتج، تصنيف، سكرول لقسم، أو رابط خارجي
                </span>
              </div>

              {/* Primary Button Setup */}
              <div className="bg-white p-4 rounded-[16px] border border-[#E7D4BC] space-y-3">
                <div className="font-bold text-xs text-[#2F2B28]">الزر الأساسي (Primary CTA)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">نص الزر</label>
                    <input
                      type="text"
                      required
                      value={slide.primary_button_text}
                      onChange={(e) => setSlide({ ...slide, primary_button_text: e.target.value })}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">نوع وجهة الرابط</label>
                    <select
                      value={primaryType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPrimaryType(val);
                        if (val === 'anchor') setSlide({ ...slide, primary_button_url: '#products-section' });
                        if (val === 'category' && categories[0]) setSlide({ ...slide, primary_button_url: `cat:${categories[0].id}` });
                        if (val === 'product' && products[0]) setSlide({ ...slide, primary_button_url: `prod:${products[0].id}` });
                        if (val === 'external') setSlide({ ...slide, primary_button_url: 'https://' });
                      }}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs font-semibold text-[#2F2B28]"
                    >
                      <option value="anchor">سكرول لقسم في الصفحة (#)</option>
                      <option value="category">ربط بتصنيف من المتجر</option>
                      <option value="product">ربط بمنتج محدد</option>
                      <option value="external">رابط خارجي (URL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">الوجهة المحددة</label>
                    {primaryType === 'category' && (
                      <select
                        value={slide.primary_button_url.startsWith('cat:') ? slide.primary_button_url.replace('cat:', '') : ''}
                        onChange={(e) => setSlide({ ...slide, primary_button_url: `cat:${e.target.value}` })}
                        className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs text-[#2F2B28]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name_ar}</option>
                        ))}
                      </select>
                    )}
                    {primaryType === 'product' && (
                      <select
                        value={slide.primary_button_url.startsWith('prod:') ? slide.primary_button_url.replace('prod:', '') : ''}
                        onChange={(e) => setSlide({ ...slide, primary_button_url: `prod:${e.target.value}` })}
                        className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs text-[#2F2B28]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name_ar}</option>
                        ))}
                      </select>
                    )}
                    {(primaryType === 'anchor' || primaryType === 'external') && (
                      <input
                        type="text"
                        value={slide.primary_button_url}
                        onChange={(e) => setSlide({ ...slide, primary_button_url: e.target.value })}
                        placeholder={primaryType === 'anchor' ? '#products-section' : 'https://...'}
                        className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs font-mono text-left"
                      />
                    )}
                  </div>
                </div>

                {/* Colors for Primary Button */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">خلفية الزر</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={slide.button_bg || '#2F2B28'}
                        onChange={(e) => setSlide({ ...slide, button_bg: e.target.value })}
                        className="w-8 h-8 rounded-[8px] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={slide.button_bg || '#2F2B28'}
                        onChange={(e) => setSlide({ ...slide, button_bg: e.target.value })}
                        className="w-full p-1.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">لون النص</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={slide.button_text_color || '#F5E9D8'}
                        onChange={(e) => setSlide({ ...slide, button_text_color: e.target.value })}
                        className="w-8 h-8 rounded-[8px] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={slide.button_text_color || '#F5E9D8'}
                        onChange={(e) => setSlide({ ...slide, button_text_color: e.target.value })}
                        className="w-full p-1.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Button Setup */}
              <div className="bg-white p-4 rounded-[16px] border border-[#E7D4BC] space-y-3">
                <div className="font-bold text-xs text-[#2F2B28]">الزر الثانوي (Secondary CTA - اختياري)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">نص الزر</label>
                    <input
                      type="text"
                      value={slide.secondary_button_text || ''}
                      onChange={(e) => setSlide({ ...slide, secondary_button_text: e.target.value })}
                      placeholder="اتركه فارغاً لإلغاء الزر"
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">نوع وجهة الرابط</label>
                    <select
                      value={secondaryType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setSecondaryType(val);
                        if (val === 'anchor') setSlide({ ...slide, secondary_button_url: '#categories-section' });
                        if (val === 'category' && categories[0]) setSlide({ ...slide, secondary_button_url: `cat:${categories[0].id}` });
                        if (val === 'product' && products[0]) setSlide({ ...slide, secondary_button_url: `prod:${products[0].id}` });
                        if (val === 'external') setSlide({ ...slide, secondary_button_url: 'https://' });
                      }}
                      className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs font-semibold text-[#2F2B28]"
                    >
                      <option value="anchor">سكرول لقسم في الصفحة (#)</option>
                      <option value="category">ربط بتصنيف من المتجر</option>
                      <option value="product">ربط بمنتج محدد</option>
                      <option value="external">رابط خارجي (URL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#2F2B28]">الوجهة المحددة</label>
                    {secondaryType === 'category' && (
                      <select
                        value={slide.secondary_button_url?.startsWith('cat:') ? slide.secondary_button_url.replace('cat:', '') : ''}
                        onChange={(e) => setSlide({ ...slide, secondary_button_url: `cat:${e.target.value}` })}
                        className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs text-[#2F2B28]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name_ar}</option>
                        ))}
                      </select>
                    )}
                    {secondaryType === 'product' && (
                      <select
                        value={slide.secondary_button_url?.startsWith('prod:') ? slide.secondary_button_url.replace('prod:', '') : ''}
                        onChange={(e) => setSlide({ ...slide, secondary_button_url: `prod:${e.target.value}` })}
                        className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs text-[#2F2B28]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name_ar}</option>
                        ))}
                      </select>
                    )}
                    {(secondaryType === 'anchor' || secondaryType === 'external') && (
                      <input
                        type="text"
                        value={slide.secondary_button_url || ''}
                        onChange={(e) => setSlide({ ...slide, secondary_button_url: e.target.value })}
                        placeholder={secondaryType === 'anchor' ? '#categories-section' : 'https://...'}
                        className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs font-mono text-left"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Storage Setup Notice Banner */}
        {slideStorageNotice && (
          <div className="mx-6 my-2 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-[14px] flex items-start gap-2 text-xs shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{slideStorageNotice}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                تم الاحتفاظ بصور الشريحة للمعاينة في النموذج، ولكن يلزم إعداد خادم التخزين قبل الحفظ النهائي أو استخدام رابط خارجي.
              </p>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FBF8F3] border-t border-[#E5D8C9] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-[12px] text-xs font-semibold text-[#6F584A] hover:bg-[#E7D4BC] transition-colors cursor-pointer"
          >
            إلغاء والتراجع
          </button>
          <button
            type="submit"
            form="hero-slide-form"
            className="px-6 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold text-xs rounded-[14px] border border-[#4A3E37] shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>حفظ الشريحة واعتماد التعديلات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
