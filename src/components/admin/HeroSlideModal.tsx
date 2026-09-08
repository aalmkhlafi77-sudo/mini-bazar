import React, { useState } from 'react';
import { Sparkles, X, Layout, Layers, Image as ImageIcon, Check, Sliders } from 'lucide-react';
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(slide);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 text-right border border-[#E5D8C9] shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5D8C9]">
          <div>
            <h3 className="text-base font-bold text-[#2F2B28] font-heading">
              إعدادات وتخصيص شريحة الهيرو وخلفيتها
            </h3>
            <p className="text-[11px] text-[#7C736D]">
              التحكم بالنمط (خلفية بالحجم الكامل أو مقسمة)، الصور، النصوص، الألوان، ودرجة التعتيم
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] flex items-center justify-center transition-transform active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Layout Type Selection */}
          <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
            <h4 className="font-bold text-[#2F2B28] text-xs flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-[#C6A36A]" />
              <span>نمط عرض الشريحة (Layout Style)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSlide({ ...slide, layout_type: 'full_background' })}
                className={`p-3 rounded-[12px] border text-right transition-all flex items-start gap-2.5 ${
                  slide.layout_type === 'full_background'
                    ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                    : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5">
                  {slide.layout_type === 'full_background' && <div className="w-2.5 h-2.5 rounded-full bg-[#C6A36A]" />}
                </div>
                <div>
                  <span className="font-bold block text-xs">خلفية بالحجم الكامل (Full Background)</span>
                  <span className={`text-[11px] block mt-0.5 ${slide.layout_type === 'full_background' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                    الصورة تمتد على كامل العرض والارتفاع مع نصوص فوقها بدقة فائقة.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSlide({ ...slide, layout_type: 'split' })}
                className={`p-3 rounded-[12px] border text-right transition-all flex items-start gap-2.5 ${
                  slide.layout_type === 'split'
                    ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md'
                    : 'border-[#D9C1A7] bg-white text-[#2F2B28] hover:border-[#6F584A]'
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5">
                  {slide.layout_type === 'split' && <div className="w-2.5 h-2.5 rounded-full bg-[#C6A36A]" />}
                </div>
                <div>
                  <span className="font-bold block text-xs">شريحة مقسمة (Split Card)</span>
                  <span className={`text-[11px] block mt-0.5 ${slide.layout_type === 'split' ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                    نص في اليمين وبطاقة صورة المنتج المميزة في اليسار.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Background Images & Full-size settings */}
          <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
            <h4 className="font-bold text-[#2F2B28] text-xs flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#C6A36A]" />
              <span>الصور والخلفيات بالحجم الكامل</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <ImageUploader
                  value={slide.desktop_image}
                  onChange={(url) => setSlide({ ...slide, desktop_image: url, mobile_image: url })}
                  label="صورة المنتج / البانر الأساسية"
                  aspectRatioHint="أبعاد مربعة 1:1 أو 4:3"
                  maxDimension={1200}
                  quality={0.82}
                />
              </div>
              <div>
                <ImageUploader
                  value={slide.background_image || ''}
                  onChange={(url) => setSlide({ ...slide, background_image: url })}
                  label="صورة الخلفية العريضة بالحجم الكامل (16:9)"
                  aspectRatioHint="صورة عالية الدقة تغطي كامل الهيرو"
                  maxDimension={1400}
                  quality={0.80}
                />
              </div>
            </div>

            {/* Overlay & Blur Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5D8C9]">
              <div>
                <label className="block font-semibold mb-1">تعتيم الخلفية لتوضيح النصوص</label>
                <div className="flex items-center gap-2 bg-white p-2 border border-[#D9C1A7] rounded-[10px]">
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
                <label className="block font-semibold mb-1">لون قاعدة الخلفية</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.background_value?.startsWith('#') ? slide.background_value : '#FBF8F3'}
                    onChange={(e) => setSlide({ ...slide, background_value: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.background_value || '#FBF8F3'}
                    onChange={(e) => setSlide({ ...slide, background_value: e.target.value })}
                    className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 border border-[#D9C1A7] rounded-[10px]">
                  <input
                    type="checkbox"
                    checked={Boolean(slide.background_blur)}
                    onChange={(e) => setSlide({ ...slide, background_blur: e.target.checked })}
                    className="w-4 h-4 accent-[#2F2B28]"
                  />
                  <span className="font-semibold text-[11px] text-[#2F2B28]">
                    تشويش الخلفية (Blur)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Texts and Colors */}
          <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
            <h4 className="font-bold text-[#2F2B28] text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A36A]" />
              <span>العناوين والنصوص</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">العنوان الرئيسي</label>
                <input
                  type="text"
                  required
                  value={slide.title_ar}
                  onChange={(e) => setSlide({ ...slide, title_ar: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">لون العنوان</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.title_color || (slide.layout_type === 'full_background' ? '#FFFFFF' : '#2F2B28')}
                    onChange={(e) => setSlide({ ...slide, title_color: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.title_color || (slide.layout_type === 'full_background' ? '#FFFFFF' : '#2F2B28')}
                    onChange={(e) => setSlide({ ...slide, title_color: e.target.value })}
                    className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">وصف الشريحة</label>
                <textarea
                  rows={2}
                  value={slide.description_ar}
                  onChange={(e) => setSlide({ ...slide, description_ar: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">لون الوصف</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.description_color || (slide.layout_type === 'full_background' ? '#F5E9D8' : '#5F5751')}
                    onChange={(e) => setSlide({ ...slide, description_color: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.description_color || (slide.layout_type === 'full_background' ? '#F5E9D8' : '#5F5751')}
                    onChange={(e) => setSlide({ ...slide, description_color: e.target.value })}
                    className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">شارة الشريحة (Badge)</label>
                <input
                  type="text"
                  value={slide.badge_ar || ''}
                  onChange={(e) => setSlide({ ...slide, badge_ar: e.target.value })}
                  placeholder="مثال: تشكيلة الموسم الجديد"
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">محاذاة النص</label>
                <select
                  value={slide.text_alignment || 'right'}
                  onChange={(e) => setSlide({ ...slide, text_alignment: e.target.value as 'right' | 'center' | 'left' })}
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                >
                  <option value="right">يمين (افتراضي)</option>
                  <option value="center">توسيط في المنتصف</option>
                  <option value="left">يسار</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">خلفية الشارة</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={slide.badge_bg || '#F4ECE2'}
                    onChange={(e) => setSlide({ ...slide, badge_bg: e.target.value })}
                    className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.badge_bg || '#F4ECE2'}
                    onChange={(e) => setSlide({ ...slide, badge_bg: e.target.value })}
                    className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Action Buttons (CTA) */}
          <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
            <h4 className="font-bold text-[#2F2B28] text-xs">أزرار الشريحة (CTA)</h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">نص الزر الأساسي</label>
                <input
                  type="text"
                  value={slide.primary_button_text}
                  onChange={(e) => setSlide({ ...slide, primary_button_text: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">رابط الزر</label>
                <input
                  type="text"
                  value={slide.primary_button_url}
                  onChange={(e) => setSlide({ ...slide, primary_button_url: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">خلفية الزر</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={slide.button_bg || '#2F2B28'}
                    onChange={(e) => setSlide({ ...slide, button_bg: e.target.value })}
                    className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.button_bg || '#2F2B28'}
                    onChange={(e) => setSlide({ ...slide, button_bg: e.target.value })}
                    className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">لون نص الزر</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={slide.button_text_color || '#F5E9D8'}
                    onChange={(e) => setSlide({ ...slide, button_text_color: e.target.value })}
                    className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.button_text_color || '#F5E9D8'}
                    onChange={(e) => setSlide({ ...slide, button_text_color: e.target.value })}
                    className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                  />
                </div>
              </div>
            </div>

            {/* Secondary button */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E5D8C9]">
              <div>
                <label className="block font-semibold mb-1">نص الزر الثانوي (اختياري)</label>
                <input
                  type="text"
                  value={slide.secondary_button_text || ''}
                  onChange={(e) => setSlide({ ...slide, secondary_button_text: e.target.value })}
                  placeholder="مثال: اكتشفي التشكيلة"
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">رابط الزر الثانوي</label>
                <input
                  type="text"
                  value={slide.secondary_button_url || ''}
                  onChange={(e) => setSlide({ ...slide, secondary_button_url: e.target.value })}
                  placeholder="#products-section"
                  className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">خلفية الثانوي</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={slide.secondary_button_bg || '#F4ECE2'}
                    onChange={(e) => setSlide({ ...slide, secondary_button_bg: e.target.value })}
                    className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.secondary_button_bg || '#F4ECE2'}
                    onChange={(e) => setSlide({ ...slide, secondary_button_bg: e.target.value })}
                    className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">لون نص الثانوي</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={slide.secondary_button_text_color || '#6F584A'}
                    onChange={(e) => setSlide({ ...slide, secondary_button_text_color: e.target.value })}
                    className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={slide.secondary_button_text_color || '#6F584A'}
                    onChange={(e) => setSlide({ ...slide, secondary_button_text_color: e.target.value })}
                    className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5D8C9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#7C736D]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold rounded-[12px] border border-[#4A3E37] shadow-sm transition-all active:scale-95"
            >
              حفظ الشريحة واعتماد التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
