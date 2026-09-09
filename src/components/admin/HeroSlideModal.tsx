import React, { useState } from 'react';
import { Sparkles, X, Layout, Image as ImageIcon, MoveHorizontal, MoveVertical, Maximize2, Star, Flame, Eye, Compass, Sliders, Check } from 'lucide-react';
import { HeroSlide } from '../../types';
import { ImageUploader } from '../ImageUploader';

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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              تخصيص نمط العرض، تموضع الصور الأفقي أو الاحتواء، تأثيرات انتشار الجزيئات الطائرة، والنصوص الفاخرة
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#F4ECE2] text-[#6F584A] border border-[#E7D4BC] flex items-center justify-center transition-transform active:scale-95 shadow-2xs"
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
                  className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-3 ${
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
                  className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-3 ${
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
                  className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-3 ${
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

            {/* 2. Image Uploads with Roomy Layout */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
              <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C6A36A]" />
                <span>رفع وتعديل صور الهيرو</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-4 rounded-[16px] border border-[#E7D4BC] min-w-0">
                  <ImageUploader
                    value={slide.desktop_image}
                    onChange={(url) => setSlide({ ...slide, desktop_image: url, mobile_image: url })}
                    label="صورة المنتج أو البانر الأساسية"
                    aspectRatioHint="أبعاد مربعة 1:1 أو 4:3 أو 16:9"
                    maxDimension={1200}
                    quality={0.82}
                    imageFit={slide.image_fit || 'contain'}
                    onImageFitChange={(fit) => setSlide({ ...slide, image_fit: fit })}
                  />
                </div>

                <div className="bg-white p-4 rounded-[16px] border border-[#E7D4BC] min-w-0">
                  <ImageUploader
                    value={slide.background_image || ''}
                    onChange={(url) => setSlide({ ...slide, background_image: url })}
                    label="صورة الخلفية السينمائية العريضة (16:9)"
                    aspectRatioHint="صورة عالية الدقة تغطي كامل إطار الهيرو"
                    maxDimension={1400}
                    quality={0.80}
                    imageFit={slide.image_fit || 'contain'}
                    onImageFitChange={(fit) => setSlide({ ...slide, image_fit: fit })}
                  />
                </div>
              </div>

              {/* 3. Image Display Fit Option with 3 Cards */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <MoveHorizontal className="w-4 h-4 text-[#C6A36A]" />
                  <label className="font-bold text-xs sm:text-sm text-[#2F2B28]">
                    طريقة تموضع وعرض الصورة (لضمان ظهورها بشكل كامل ومناسب دون اقتصاص):
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Contain */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_fit: 'contain' })}
                    className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-2.5 ${
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
                    className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-2.5 ${
                      slide.image_fit === 'cover'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">تمدد كامل يملأ المساحة (Cover)</span>
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

                  {/* Full Width Horizontal */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_fit: 'full_width' })}
                    className={`p-3.5 rounded-[16px] border text-right transition-all flex flex-col justify-between gap-2.5 ${
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

              {/* Focal Alignment (Vertical Position) to prevent top cropping */}
              <div className="pt-2 border-t border-[#E5D8C9]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <MoveVertical className="w-4 h-4 text-[#C6A36A]" />
                    <label className="font-bold text-xs sm:text-sm text-[#2F2B28]">
                      نقطة تركيز ومحاذاة الصورة (لمنع قص الرأس والعناوين العلوية):
                    </label>
                  </div>
                  <span className="text-[11px] text-[#8A7465] bg-[#F4ECE2] px-2.5 py-0.5 rounded-full font-medium">
                    موصى به: أعلى
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Top */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_position: 'top' })}
                    className={`p-3 rounded-[14px] border text-right transition-all flex items-center justify-between gap-2 ${
                      (slide.image_position || 'top') === 'top'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-sm'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>أعلى (Top)</span>
                        <span className="text-[10px] text-[#C6A36A] font-normal">(حماية الرأس والعناوين)</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${
                        (slide.image_position || 'top') === 'top' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                      }`}>
                        يثبت أعلى الصورة ليظهر النص العلوي والرأس دون أي قص
                      </p>
                    </div>
                    {(slide.image_position || 'top') === 'top' && (
                      <div className="w-4 h-4 rounded-full bg-[#C6A36A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#2F2B28]" />
                      </div>
                    )}
                  </button>

                  {/* Center */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_position: 'center' })}
                    className={`p-3 rounded-[14px] border text-right transition-all flex items-center justify-between gap-2 ${
                      slide.image_position === 'center'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-sm'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs">وسط (Center)</span>
                      <p className={`text-[10px] mt-0.5 ${
                        slide.image_position === 'center' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                      }`}>
                        توسيط الصورة رأسياً وأفقياً
                      </p>
                    </div>
                    {slide.image_position === 'center' && (
                      <div className="w-4 h-4 rounded-full bg-[#C6A36A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#2F2B28]" />
                      </div>
                    )}
                  </button>

                  {/* Bottom */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, image_position: 'bottom' })}
                    className={`p-3 rounded-[14px] border text-right transition-all flex items-center justify-between gap-2 ${
                      slide.image_position === 'bottom'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-sm'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs">أسفل (Bottom)</span>
                      <p className={`text-[10px] mt-0.5 ${
                        slide.image_position === 'bottom' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                      }`}>
                        تثبيت أسفل الصورة وإبراز التفاصيل السفلية
                      </p>
                    </div>
                    {slide.image_position === 'bottom' && (
                      <div className="w-4 h-4 rounded-full bg-[#C6A36A] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#2F2B28]" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Desktop & Fullscreen Height Adaptation */}
              <div className="pt-2 border-t border-[#E5D8C9]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-[#C6A36A]" />
                    <label className="font-bold text-xs sm:text-sm text-[#2F2B28]">
                      ارتفاع الهيرو عند الشاشة الكاملة (لملاءمة أبعاد الصور الكبيرة دون ضغط):
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Standard */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, desktop_height: 'standard' })}
                    className={`p-3 rounded-[14px] border text-right transition-all flex flex-col justify-between gap-1 ${
                      (slide.desktop_height || 'standard') === 'standard' || slide.desktop_height === 'cinematic' || slide.desktop_height === 'fullscreen'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-xs'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">قياسي متوازن (الافتراضي)</span>
                      {((slide.desktop_height || 'standard') === 'standard' || slide.desktop_height === 'cinematic' || slide.desktop_height === 'fullscreen') && (
                        <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                      )}
                    </div>
                    <span className={`text-[11px] leading-relaxed ${
                      ((slide.desktop_height || 'standard') === 'standard' || slide.desktop_height === 'cinematic' || slide.desktop_height === 'fullscreen') ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                    }`}>
                      ارتفاع طبيعي متوازن ومريح متجاوب مع جميع الشاشات وأجهزة الجوال والكمبيوتر.
                    </span>
                  </button>

                  {/* Compact */}
                  <button
                    type="button"
                    onClick={() => setSlide({ ...slide, desktop_height: 'compact' })}
                    className={`p-3 rounded-[14px] border text-right transition-all flex flex-col justify-between gap-1 ${
                      slide.desktop_height === 'compact'
                        ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-xs'
                        : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">مدمج مختصر (Compact)</span>
                      {slide.desktop_height === 'compact' && (
                        <div className="w-2 h-2 rounded-full bg-[#C6A36A]" />
                      )}
                    </div>
                    <span className={`text-[11px] leading-relaxed ${
                      slide.desktop_height === 'compact' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'
                    }`}>
                      ارتفاع مختصر وخفيف يتيح للمتسوق رؤية المنتجات والتصنيفات بسرعة.
                    </span>
                  </button>
                </div>
              </div>

              {/* Overlay, Base Color & Blur Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E5D8C9]">
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">
                    تعتيم الخلفية لتوضيح النصوص
                  </label>
                  <div className="flex items-center gap-2 bg-white p-2.5 border border-[#D9C1A7] rounded-[12px]">
                    <input
                      type="range"
                      min="0"
                      max="85"
                      step="5"
                      value={slide.overlay_opacity !== undefined ? slide.overlay_opacity : 30}
                      onChange={(e) => setSlide({ ...slide, overlay_opacity: Number(e.target.value) })}
                      className="flex-1 accent-[#2F2B28]"
                    />
                    <span className="font-bold text-[#6F584A] w-9 text-left">
                      {slide.overlay_opacity !== undefined ? slide.overlay_opacity : 30}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">
                    لون قاعدة الخلفية
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={slide.background_value?.startsWith('#') ? slide.background_value : '#FBF8F3'}
                      onChange={(e) => setSlide({ ...slide, background_value: e.target.value })}
                      className="w-10 h-10 p-0.5 rounded-[10px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.background_value || '#FBF8F3'}
                      onChange={(e) => setSlide({ ...slide, background_value: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs font-mono text-left"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 cursor-pointer bg-white p-2.5 border border-[#D9C1A7] rounded-[12px] hover:bg-[#FBF8F3] transition-colors">
                    <input
                      type="checkbox"
                      checked={Boolean(slide.background_blur)}
                      onChange={(e) => setSlide({ ...slide, background_blur: e.target.checked })}
                      className="w-4 h-4 accent-[#2F2B28] rounded-xs"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#2F2B28] block">
                        تشويش الخلفية (Cinematic Blur)
                      </span>
                      <span className="text-[10px] text-[#7C736D] block">
                        إضفاء لمسة ضبابية ناعمة لزيادة بروز النص
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 4. Hero Flying Particles Effect Selection */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C6A36A]" />
                  <span>تأثير انتشار الجزيئات الطائرة على الهيرو (Floating Particles Effect)</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-[#C6A36A]/20 text-[#6F584A] text-[10px] font-bold">
                  تأثير بصري متحرك
                </span>
              </div>

              {/* Particles Style Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {[
                  { id: 'none', label: 'بدون جزيئات', desc: 'عرض عادي هادئ', icon: Eye },
                  { id: 'golden_sparkles', label: '✨ بريق وشرارات ذهبية', desc: 'شرارات متألقة طافية', icon: Sparkles },
                  { id: 'luxury_dust', label: '🌌 غبار كوني فاخر', desc: 'ذرات دقيقة تسبح بنعومة', icon: Compass },
                  { id: 'floating_stars', label: '⭐ نجوم وألماسات لامعة', desc: 'نجوم مشعة متصاعدة', icon: Star },
                  { id: 'ambient_glow', label: '💫 توهج وأضواء دافئة', desc: 'كرات ضوئية خافتة ناعمة', icon: Flame },
                ].map((item) => {
                  const isSelected = (slide.particles_effect || 'none') === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSlide({ ...slide, particles_effect: item.id as HeroSlide['particles_effect'] })}
                      className={`p-3 rounded-[14px] border text-right transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-sm'
                          : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs leading-tight">{item.label}</span>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#C6A36A] shrink-0" />}
                      </div>
                      <span className={`text-[10px] ${isSelected ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Density & Speed Controls (Shown only if particles active) */}
              {slide.particles_effect && slide.particles_effect !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E5D8C9] bg-white p-3.5 rounded-[16px]">
                  <div>
                    <label className="block font-bold text-xs mb-1.5 text-[#2F2B28]">
                      كثافة الجزيئات (Particle Density):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', label: 'خفيفة وهادئة' },
                        { id: 'medium', label: 'متوازنة' },
                        { id: 'high', label: 'مكثفة وساحرة' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSlide({ ...slide, particles_density: d.id as any })}
                          className={`py-1.5 px-2 rounded-[10px] font-semibold text-center text-[11px] transition-all ${
                            (slide.particles_density || 'medium') === d.id
                              ? 'bg-[#2F2B28] text-white shadow-xs'
                              : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs mb-1.5 text-[#2F2B28]">
                      سرعة حركة الجزيئات (Animation Speed):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'slow', label: 'بطيئة انسيابية' },
                        { id: 'normal', label: 'طبيعية' },
                        { id: 'fast', label: 'حيوية وسريعة' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSlide({ ...slide, particles_speed: s.id as any })}
                          className={`py-1.5 px-2 rounded-[10px] font-semibold text-center text-[11px] transition-all ${
                            (slide.particles_speed || 'normal') === s.id
                              ? 'bg-[#2F2B28] text-white shadow-xs'
                              : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Texts & Titles */}
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

            {/* 6. Buttons & CTAs */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
              <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C6A36A]" />
                <span>أزرار الإجراء والروابط (Call To Action)</span>
              </h4>

              {/* Primary Button */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-[16px] border border-[#E7D4BC]">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-[#2F2B28]">نص الزر الأساسي</label>
                  <input
                    type="text"
                    required
                    value={slide.primary_button_text}
                    onChange={(e) => setSlide({ ...slide, primary_button_text: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">خلفية الزر</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={slide.button_bg || '#2F2B28'}
                      onChange={(e) => setSlide({ ...slide, button_bg: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.button_bg || '#2F2B28'}
                      onChange={(e) => setSlide({ ...slide, button_bg: e.target.value })}
                      className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
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
                      className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.button_text_color || '#F5E9D8'}
                      onChange={(e) => setSlide({ ...slide, button_text_color: e.target.value })}
                      className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Button */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-[16px] border border-[#E7D4BC]">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-[#2F2B28]">نص الزر الثانوي (اختياري)</label>
                  <input
                    type="text"
                    value={slide.secondary_button_text || ''}
                    onChange={(e) => setSlide({ ...slide, secondary_button_text: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">خلفية الزر</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={slide.secondary_button_bg || '#F4ECE2'}
                      onChange={(e) => setSlide({ ...slide, secondary_button_bg: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.secondary_button_bg || '#F4ECE2'}
                      onChange={(e) => setSlide({ ...slide, secondary_button_bg: e.target.value })}
                      className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">لون النص</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={slide.secondary_button_text_color || '#6F584A'}
                      onChange={(e) => setSlide({ ...slide, secondary_button_text_color: e.target.value })}
                      className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={slide.secondary_button_text_color || '#6F584A'}
                      onChange={(e) => setSlide({ ...slide, secondary_button_text_color: e.target.value })}
                      className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FBF8F3] border-t border-[#E5D8C9] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-[12px] text-xs font-semibold text-[#6F584A] hover:bg-[#E7D4BC] transition-colors"
          >
            إلغاء والتراجع
          </button>
          <button
            type="submit"
            form="hero-slide-form"
            className="px-6 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold text-xs rounded-[14px] border border-[#4A3E37] shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span>حفظ الشريحة واعتماد التعديلات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
