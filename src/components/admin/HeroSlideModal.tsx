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
  Sun,
  Eye,
  ZoomIn,
  Contrast,
  RotateCcw,
  Layers,
  Check,
  Flame,
  Square,
  Maximize2,
  Box,
  Gem,
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
    overlay_opacity: initialSlide.overlay_opacity !== undefined ? initialSlide.overlay_opacity : 0,
    background_blur: Boolean(initialSlide.background_blur),
    blur_amount: initialSlide.blur_amount !== undefined ? initialSlide.blur_amount : (initialSlide.background_blur ? 6 : 0),
    brightness: initialSlide.brightness !== undefined ? initialSlide.brightness : 100,
    contrast: initialSlide.contrast !== undefined ? initialSlide.contrast : 100,
    zoom_scale: initialSlide.zoom_scale !== undefined ? initialSlide.zoom_scale : 100,
    show_scrim_gradient: initialSlide.show_scrim_gradient ?? false,
    ambient_blur_layer: initialSlide.ambient_blur_layer ?? false,
    banner_border_style: initialSlide.banner_border_style || 'subtle_card',
    banner_border_radius: initialSlide.banner_border_radius || 'lg',
    banner_shadow_style: initialSlide.banner_shadow_style || 'deep',
    image_fit: initialSlide.image_fit || 'contain',
    image_position: initialSlide.image_position || 'top',
    desktop_height: initialSlide.desktop_height || 'standard',
    particles_effect: initialSlide.particles_effect || 'none',
    particles_density: initialSlide.particles_density || 'medium',
    particles_speed: initialSlide.particles_speed || 'normal',
    primary_button_url: initialSlide.primary_button_url || '#products-section',
    secondary_button_url: initialSlide.secondary_button_url || '',
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'background' | 'composite'>('desktop');

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

  const applyPreset = (preset: 'ultra_clear' | 'vivid_bright' | 'high_zoom' | 'soft_blur' | 'reset') => {
    switch (preset) {
      case 'ultra_clear':
        setSlide((prev) => ({
          ...prev,
          blur_amount: 0,
          background_blur: false,
          brightness: 100,
          contrast: 106,
          zoom_scale: 100,
          overlay_opacity: 0,
          show_scrim_gradient: false,
          ambient_blur_layer: false,
        }));
        break;
      case 'vivid_bright':
        setSlide((prev) => ({
          ...prev,
          blur_amount: 0,
          background_blur: false,
          brightness: 115,
          contrast: 110,
          zoom_scale: 100,
          overlay_opacity: 0,
          show_scrim_gradient: false,
        }));
        break;
      case 'high_zoom':
        setSlide((prev) => ({
          ...prev,
          blur_amount: 0,
          background_blur: false,
          brightness: 100,
          contrast: 100,
          zoom_scale: 115,
          overlay_opacity: 5,
        }));
        break;
      case 'soft_blur':
        setSlide((prev) => ({
          ...prev,
          blur_amount: 8,
          background_blur: true,
          brightness: 90,
          contrast: 100,
          zoom_scale: 100,
          overlay_opacity: 35,
          show_scrim_gradient: true,
        }));
        break;
      case 'reset':
        setSlide((prev) => ({
          ...prev,
          blur_amount: 0,
          background_blur: false,
          brightness: 100,
          contrast: 100,
          zoom_scale: 100,
          overlay_opacity: 0,
          show_scrim_gradient: false,
          ambient_blur_layer: false,
          banner_border_style: 'subtle_card',
          banner_border_radius: 'lg',
          banner_shadow_style: 'deep',
        }));
        break;
    }
  };

  const getModalBorderRadiusClass = (radius: string = 'lg') => {
    switch (radius) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-[8px] sm:rounded-[10px]';
      case 'md':
        return 'rounded-[14px] sm:rounded-[16px]';
      case 'lg':
        return 'rounded-[18px] sm:rounded-[22px]';
      case 'pill':
        return 'rounded-[30px] sm:rounded-[36px]';
      default:
        return 'rounded-[18px] sm:rounded-[22px]';
    }
  };

  const getModalBorderStyleClass = (style: string = 'subtle_card') => {
    switch (style) {
      case 'none':
        return 'border-0 ring-0';
      case 'glass':
        return 'border-2 border-white/60 backdrop-blur-md ring-1 ring-white/30';
      case 'polished':
        return 'border-2 border-[#D9C1A7] ring-2 ring-[#C6A36A]/40 shadow-inner';
      case 'gold_luxury':
        return 'border-2 border-[#C6A36A] ring-1 ring-[#C6A36A]/20';
      case 'floating_glow':
        return 'border border-[#C6A36A]/60 shadow-[0_0_20px_rgba(198,163,106,0.35)]';
      case 'vintage_bevel':
        return 'border-4 border-[#F4ECE2] ring-2 ring-[#8A7465]/30';
      case 'subtle_card':
      default:
        return 'border-3 border-white';
    }
  };

  const getModalShadowClass = (shadow: string = 'deep') => {
    switch (shadow) {
      case 'none':
        return 'shadow-none';
      case 'soft':
        return 'shadow-md';
      case 'deep':
        return 'shadow-xl';
      case 'golden_glow':
        return 'shadow-[0_10px_25px_rgba(198,163,106,0.35)]';
      default:
        return 'shadow-lg';
    }
  };

  const activeImage =
    previewDevice === 'background'
      ? slide.background_image || slide.desktop_image || ''
      : previewDevice === 'mobile' && slide.mobile_image
      ? slide.mobile_image
      : slide.desktop_image || slide.background_image || '';

  const activeBlur = slide.blur_amount ?? (slide.background_blur ? 6 : 0);
  const activeBrightness = slide.brightness ?? 100;
  const activeContrast = slide.contrast ?? 100;
  const activeZoom = slide.zoom_scale ?? 100;
  const activeOverlay = slide.overlay_opacity ?? 0;
  const activeScrim = slide.show_scrim_gradient ?? false;
  const bannerBorderRadius = slide.banner_border_radius || 'lg';
  const bannerBorderStyle = slide.banner_border_style || 'subtle_card';
  const bannerShadowStyle = slide.banner_shadow_style || 'deep';

  const previewTransformStyle: React.CSSProperties = {
    filter: `blur(${activeBlur}px) brightness(${activeBrightness}%) contrast(${activeContrast}%)`,
    transform: `scale(${activeZoom / 100})`,
    transformOrigin:
      slide.image_position === 'top'
        ? 'top center'
        : slide.image_position === 'bottom'
        ? 'bottom center'
        : 'center center',
    transition: 'filter 0.2s ease, transform 0.2s ease',
  };

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
              <div className="bg-white p-4 sm:p-5 rounded-[18px] border-2 border-[#E7D4BC] min-w-0 space-y-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4ECE2] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#C6A36A]/20 flex items-center justify-center text-[#8A7465]">
                      <Sparkles className="w-4 h-4 text-[#C6A36A]" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#2F2B28] block">
                        صورة الخلفية الإضافية (Background Wallpaper - اختياري)
                      </span>
                      <p className="text-[11px] text-[#7C736D]">
                        خلفية سينمائية بانورامية تظهر تحت المحتوى وتمتد على كامل الشاشة
                      </p>
                    </div>
                  </div>

                  {/* Preview & Status Controls */}
                  <div className="flex items-center gap-2">
                    {slide.background_image ? (
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('background')}
                        className={`px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          previewDevice === 'background'
                            ? 'bg-[#2F2B28] text-white ring-2 ring-[#C6A36A]'
                            : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C6A36A]" />
                        <span>معاينة الخلفية بالاستوديو</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#A89F91] bg-[#FBF8F3] px-2.5 py-1 rounded-full border border-[#E7D4BC]">
                        لم يتم اختيار خلفية إضافية
                      </span>
                    )}
                  </div>
                </div>

                <ImageUploader
                  value={slide.background_image || ''}
                  onChange={(url) => setSlide((prev) => ({ ...prev, background_image: url }))}
                  label="خلفية سينمائية تظهر تحت المحتوى"
                  aspectRatioHint="صورة بانورامية 16:9 أو فائقة العرض بدقة عالية"
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

            {/* 3. Clarity, Lighting, Blur, Contrast & Zoom Studio */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border-2 border-[#C6A36A]/40 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7D4BC] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C6A36A]/20 flex items-center justify-center text-[#8A7465]">
                    <Sliders className="w-4 h-4 text-[#C6A36A]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-1.5">
                      <span>استوديو دقة الوضوح، الإضاءة، الضبابية، والزوم</span>
                      <span className="bg-[#C6A36A] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        جديد
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#7C736D]">
                      تحكم كامل بدرجة إضاءة الصورة، وضوحها التام (0px)، إزالة التعتيم، وتعديل نسبة الزوم والملاءمة
                    </p>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('ultra_clear')}
                    className="px-2.5 py-1 bg-white hover:bg-[#2F2B28] hover:text-white text-[#2F2B28] border border-[#D9C1A7] rounded-[10px] text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="إلغاء أي ضبابية أو تعتيم للحصول على صورة نقية 100%"
                  >
                    <Eye className="w-3 h-3 text-[#C6A36A]" />
                    <span>💎 أقصى وضوح ونقاء</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('vivid_bright')}
                    className="px-2.5 py-1 bg-white hover:bg-[#2F2B28] hover:text-white text-[#2F2B28] border border-[#D9C1A7] rounded-[10px] text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="زيادة السطوع والتباين لإبراز التفاصيل"
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>☀️ إضاءة ساطعة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('high_zoom')}
                    className="px-2.5 py-1 bg-white hover:bg-[#2F2B28] hover:text-white text-[#2F2B28] border border-[#D9C1A7] rounded-[10px] text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="تكبير مركز للصورة مع الحفاظ على الأبعاد"
                  >
                    <ZoomIn className="w-3 h-3 text-[#C6A36A]" />
                    <span>🔍 زوم مركز</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('reset')}
                    className="px-2 py-1 bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] rounded-[10px] text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    title="إعادة تعيين إلى 100% افتراضي نقي"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة ضبط</span>
                  </button>
                </div>
              </div>

              {/* Real-time Interactive Live Preview */}
              <div className="bg-[#2F2B28] rounded-[18px] p-3.5 border border-[#4A3E37] space-y-2">
                <div className="flex items-center justify-between text-white text-[11px] pb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold flex items-center gap-1.5 text-[#E7D4BC]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      معاينة مباشرة فورية لتأثيرات الوضوح والإضاءة:
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center bg-black/40 p-0.5 rounded-lg border border-white/10 gap-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2 py-1 rounded-[6px] text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-[#C6A36A] text-[#2F2B28]' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>سطح المكتب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2 py-1 rounded-[6px] text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-[#C6A36A] text-[#2F2B28]' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>الجوال</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('background')}
                      className={`px-2 py-1 rounded-[6px] text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        previewDevice === 'background' ? 'bg-[#C6A36A] text-[#2F2B28]' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>الخلفية الإضافية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('composite')}
                      className={`px-2 py-1 rounded-[6px] text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        previewDevice === 'composite' ? 'bg-[#C6A36A] text-[#2F2B28]' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>المشهد المركّب</span>
                    </button>
                  </div>
                </div>

                {/* Preview Canvas */}
                <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-[16px] overflow-hidden bg-[#1E1B19] border border-white/20 flex items-center justify-center">
                  {/* 1. Background Wallpaper Mode */}
                  {previewDevice === 'background' ? (
                    slide.background_image ? (
                      <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                        <img
                          src={slide.background_image}
                          alt="Background Wallpaper"
                          style={previewTransformStyle}
                          className="w-full h-full object-cover"
                        />
                        {activeOverlay > 0 && (
                          <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                            style={{
                              backgroundColor: '#000000',
                              opacity: activeOverlay / 100,
                            }}
                          />
                        )}
                        {activeScrim && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                        )}
                        <div className="absolute top-2.5 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#C6A36A]/50 text-white text-[10px] font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#C6A36A]" />
                          <span>معاينة صورة الخلفية الإضافية (Background Wallpaper)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-[#A89F91]">
                        <Sparkles className="w-8 h-8 mx-auto mb-1 opacity-50 text-[#C6A36A]" />
                        <p className="text-[11px]">لم يتم تحديد صورة خلفية إضافية بعد. يمكنك اختيارها من الحقل أعلاه.</p>
                      </div>
                    )
                  ) : previewDevice === 'composite' ? (
                    /* 2. Full Composite Scene Mode (Wallpaper Behind + Styled Banner in Front) */
                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center p-3 sm:p-5">
                      {/* Ambient Wallpaper Layer */}
                      {slide.background_image && (
                        <div className="absolute inset-0 w-full h-full overflow-hidden">
                          <img
                            src={slide.background_image}
                            alt=""
                            className="w-full h-full object-cover filter blur-xs opacity-60 scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                        </div>
                      )}

                      {/* Foreground Banner Card */}
                      <div className={`relative max-h-[85%] aspect-[16/9] sm:aspect-[21/9] ${getModalBorderRadiusClass(bannerBorderRadius)} overflow-hidden ${getModalShadowClass(bannerShadowStyle)} ${getModalBorderStyleClass(bannerBorderStyle)} bg-[#2F2B28] flex items-center justify-center z-10`}>
                        {slide.desktop_image ? (
                          <img
                            src={slide.desktop_image}
                            alt=""
                            style={previewTransformStyle}
                            className={`w-full h-full ${slide.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                          />
                        ) : (
                          <div className="p-3 text-center text-white/70 text-[10px]">اختر صورة سطح المكتب</div>
                        )}
                        {activeOverlay > 0 && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ backgroundColor: '#000000', opacity: activeOverlay / 100 }}
                          />
                        )}
                        {activeScrim && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        )}
                        <div className="absolute bottom-1.5 right-2 text-right pointer-events-none z-10 max-w-[80%]">
                          <h5 className="text-[11px] font-extrabold text-white drop-shadow-md truncate">
                            {slide.title_ar || 'العنوان الرئيسي'}
                          </h5>
                        </div>
                      </div>

                      <div className="absolute top-2 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-white text-[9px] font-bold flex items-center gap-1 z-20">
                        <Layers className="w-2.5 h-2.5 text-[#C6A36A]" />
                        <span>معاينة المشهد المركب (خلفية + إطار البنر)</span>
                      </div>
                    </div>
                  ) : previewDevice === 'mobile' ? (
                    /* 3. Mobile Device Framing Mode */
                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center p-2">
                      <div className={`relative h-[90%] aspect-[9/16] max-w-[150px] ${getModalBorderRadiusClass(bannerBorderRadius)} overflow-hidden ${getModalShadowClass(bannerShadowStyle)} ${getModalBorderStyleClass(bannerBorderStyle)} bg-[#2F2B28] flex items-center justify-center`}>
                        {activeImage ? (
                          <img
                            src={activeImage}
                            alt="Mobile Preview"
                            style={previewTransformStyle}
                            className={`w-full h-full ${slide.image_fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                          />
                        ) : (
                          <div className="p-2 text-center text-white/60 text-[9px]">اختر صورة</div>
                        )}
                        {activeOverlay > 0 && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ backgroundColor: '#000000', opacity: activeOverlay / 100 }}
                          />
                        )}
                        <div className="absolute bottom-1 right-1.5 text-right pointer-events-none z-10">
                          <span className="text-[8px] font-bold text-white drop-shadow-sm truncate block max-w-[100px]">
                            {slide.title_ar || 'الهيرو'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 4. Desktop Banner Mode with Applied Border & Shadow */
                    activeImage ? (
                      <div className="relative w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-3">
                        <div className={`relative w-full h-full ${getModalBorderRadiusClass(bannerBorderRadius)} overflow-hidden ${getModalShadowClass(bannerShadowStyle)} ${getModalBorderStyleClass(bannerBorderStyle)} bg-[#2F2B28] flex items-center justify-center`}>
                          <img
                            src={activeImage}
                            alt="Hero Preview"
                            style={previewTransformStyle}
                            className={`w-full h-full ${
                              slide.image_fit === 'contain'
                                ? `object-contain ${
                                    slide.image_position === 'top'
                                      ? 'object-top'
                                      : slide.image_position === 'bottom'
                                      ? 'object-bottom'
                                      : 'object-center'
                                  }`
                                : `object-cover ${
                                    slide.image_position === 'top'
                                      ? 'object-top'
                                      : slide.image_position === 'bottom'
                                      ? 'object-bottom'
                                      : 'object-center'
                                  }`
                            }`}
                          />

                          {/* Live Overlay */}
                          {activeOverlay > 0 && (
                            <div
                              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                              style={{
                                backgroundColor: '#000000',
                                opacity: activeOverlay / 100,
                              }}
                            />
                          )}

                          {/* Live Scrim */}
                          {activeScrim && (
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
                          )}

                          {/* Live Sample Text Badge */}
                          <div className="absolute bottom-2.5 right-3 text-right pointer-events-none z-10 max-w-[70%]">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C6A36A] text-[#2F2B28] mb-0.5 shadow-sm">
                              {slide.badge_ar || 'معاينة تجريبية'}
                            </span>
                            <h5 className="text-xs sm:text-sm font-extrabold text-white drop-shadow-md truncate">
                              {slide.title_ar || 'عنوان الهيرو الرئيسي'}
                            </h5>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-[#A89F91]">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <p className="text-[11px]">يرجى اختيار صورة أولاً لتفعيل المعاينة الحية</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* 1. Blur Degree (0px to 20px) */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>درجة الضبابية والتمويه (Blur Amount):</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        activeBlur === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F4ECE2] text-[#6F584A]'
                      }`}>
                        {activeBlur === 0 ? '0px (نقي 100% فائق الوضوح)' : `${activeBlur}px (تمويه)`}
                      </span>
                      {activeBlur > 0 && (
                        <button
                          type="button"
                          onClick={() => setSlide((prev) => ({ ...prev, blur_amount: 0, background_blur: false }))}
                          className="text-[10px] text-[#C6A36A] hover:underline font-bold cursor-pointer"
                        >
                          تصفية
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={activeBlur}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSlide((prev) => ({
                        ...prev,
                        blur_amount: val,
                        background_blur: val > 0,
                      }));
                    }}
                    className="w-full accent-[#C6A36A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#7C736D]">
                    <span className="font-bold text-emerald-700">0px (وضوح فائق نقي)</span>
                    <span>10px (تمويه متوسط)</span>
                    <span>20px (ضبابي كثيف)</span>
                  </div>
                </div>

                {/* 2. Brightness / Lighting (50% to 150%) */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>الإضاءة والسطوع (Brightness / Lighting):</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        activeBrightness === 100 ? 'bg-[#F4ECE2] text-[#6F584A]' : activeBrightness > 100 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {activeBrightness}%
                      </span>
                      {activeBrightness !== 100 && (
                        <button
                          type="button"
                          onClick={() => setSlide((prev) => ({ ...prev, brightness: 100 }))}
                          className="text-[10px] text-[#C6A36A] hover:underline font-bold cursor-pointer"
                        >
                          100%
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="2"
                    value={activeBrightness}
                    onChange={(e) => setSlide((prev) => ({ ...prev, brightness: Number(e.target.value) }))}
                    className="w-full accent-[#C6A36A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#7C736D]">
                    <span>50% (خافت)</span>
                    <span className="font-bold text-[#2F2B28]">100% (طبيعي)</span>
                    <span>150% (مضيء وساطع)</span>
                  </div>
                </div>

                {/* 3. Contrast (50% to 150%) */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <Contrast className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>التباين وعمق الألوان (Contrast):</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#F4ECE2] text-[#6F584A] rounded-full text-[10px] font-mono font-bold">
                        {activeContrast}%
                      </span>
                      {activeContrast !== 100 && (
                        <button
                          type="button"
                          onClick={() => setSlide((prev) => ({ ...prev, contrast: 100 }))}
                          className="text-[10px] text-[#C6A36A] hover:underline font-bold cursor-pointer"
                        >
                          100%
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="2"
                    value={activeContrast}
                    onChange={(e) => setSlide((prev) => ({ ...prev, contrast: Number(e.target.value) }))}
                    className="w-full accent-[#C6A36A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#7C736D]">
                    <span>50% (ناعم)</span>
                    <span className="font-bold text-[#2F2B28]">100% (طبيعي)</span>
                    <span>150% (تباين حاد ومشرق)</span>
                  </div>
                </div>

                {/* 4. Zoom Scale (70% to 150%) */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>درجة ملاءمة الزوم والتكبير (Zoom Scale):</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#F4ECE2] text-[#6F584A] rounded-full text-[10px] font-mono font-bold">
                        {activeZoom}%
                      </span>
                      {activeZoom !== 100 && (
                        <button
                          type="button"
                          onClick={() => setSlide((prev) => ({ ...prev, zoom_scale: 100 }))}
                          className="text-[10px] text-[#C6A36A] hover:underline font-bold cursor-pointer"
                        >
                          100%
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="150"
                    step="2"
                    value={activeZoom}
                    onChange={(e) => setSlide((prev) => ({ ...prev, zoom_scale: Number(e.target.value) }))}
                    className="w-full accent-[#C6A36A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#7C736D]">
                    <span>70% (تصغير واحتواء أوسع)</span>
                    <span className="font-bold text-[#2F2B28]">100% (الأبعاد الحقيقية)</span>
                    <span>150% (تكبير مركز)</span>
                  </div>
                </div>

                {/* 5. Overlay Tint (0% to 90%) */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>شفافية طبقة التعتيم (Overlay Tint):</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        activeOverlay === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F4ECE2] text-[#6F584A]'
                      }`}>
                        {activeOverlay === 0 ? '0% (بدون تعتيم نهائياً)' : `${activeOverlay}%`}
                      </span>
                      {activeOverlay > 0 && (
                        <button
                          type="button"
                          onClick={() => setSlide((prev) => ({ ...prev, overlay_opacity: 0 }))}
                          className="text-[10px] text-[#C6A36A] hover:underline font-bold cursor-pointer"
                        >
                          0%
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={activeOverlay}
                    onChange={(e) => setSlide((prev) => ({ ...prev, overlay_opacity: Number(e.target.value) }))}
                    className="w-full accent-[#C6A36A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#7C736D]">
                    <span className="font-bold text-emerald-700">0% (نقاء ووضوح تام)</span>
                    <span>40% (تعتيم متوازن)</span>
                    <span>90% (داكن جداً)</span>
                  </div>
                </div>

                {/* 6. Toggles for Scrim & Ambient Backdrop */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] flex flex-col justify-between gap-2.5">
                  <div>
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>خيارات التدرج والتوهج المحيطي:</span>
                    </label>
                    <p className="text-[10px] text-[#7C736D] mt-0.5">
                      إلغاء التدرج يزيل أي ضبابية أو تعتيم محيطي ناتج عن القوالب السينمائية
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-[#F4ECE2]">
                    <label className="flex items-center justify-between p-2 rounded-[10px] bg-[#FBF8F3] border border-[#E7D4BC] cursor-pointer hover:bg-[#F4ECE2]">
                      <span className="text-[11px] font-semibold text-[#2F2B28]">
                        تفعيل التدرج السينمائي المحيطي (Scrim Gradient)
                      </span>
                      <input
                        type="checkbox"
                        checked={activeScrim}
                        onChange={(e) => setSlide((prev) => ({ ...prev, show_scrim_gradient: e.target.checked }))}
                        className="w-4 h-4 accent-[#C6A36A] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-[10px] bg-[#FBF8F3] border border-[#E7D4BC] cursor-pointer hover:bg-[#F4ECE2]">
                      <span className="text-[11px] font-semibold text-[#2F2B28]">
                        تفعيل انعكاس الخلفية المموهة (Ambient Backdrop Blur)
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(slide.ambient_blur_layer)}
                        onChange={(e) => setSlide((prev) => ({ ...prev, ambient_blur_layer: e.target.checked }))}
                        className="w-4 h-4 accent-[#C6A36A] rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Banner Border & Edge Styling Studio */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-[#FBF8F3] border-2 border-[#C6A36A]/50 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7D4BC] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#C6A36A]/20 flex items-center justify-center text-[#8A7465]">
                    <Box className="w-4 h-4 text-[#C6A36A]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2F2B28] text-xs sm:text-sm flex items-center gap-1.5">
                      <span>استوديو حواف وإطارات صورة البنر (Border & Edge Styling)</span>
                      <span className="bg-[#2F2B28] text-[#C6A36A] text-[10px] px-2 py-0.5 rounded-full font-bold">
                        خيارات متعددة
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#7C736D]">
                      تحكم كامل بحواف وإطار صورة البنر: بدون حدود، زجاجي شفاف، مصقول، ذهبي ملكي، وتوهج عائم
                    </p>
                  </div>
                </div>
              </div>

              {/* A. Border Style Options */}
              <div className="space-y-2">
                <label className="block font-bold text-xs text-[#2F2B28] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Gem className="w-3.5 h-3.5 text-[#C6A36A]" />
                    <span>نمط إطار وحواف البنر (Banner Border Style):</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#C6A36A] font-bold">
                    {slide.banner_border_style === 'none'
                      ? 'بدون حدود (خالي تماماً)'
                      : slide.banner_border_style === 'glass'
                      ? 'زجاجي شفاف (Glassmorphism)'
                      : slide.banner_border_style === 'polished'
                      ? 'مصقول معدني فاخر'
                      : slide.banner_border_style === 'gold_luxury'
                      ? 'إطار ذهبي ملكي'
                      : slide.banner_border_style === 'floating_glow'
                      ? 'توهج عائم مضيء'
                      : slide.banner_border_style === 'vintage_bevel'
                      ? 'مشطوف كلاسيكي'
                      : 'بطاقة بيضاء نقية'}
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'none',
                      label: 'بدون حدود',
                      sub: 'حواف حرة ممتدة بنقاء',
                      icon: '▫️',
                      previewBg: 'bg-[#2F2B28]',
                      previewBorder: 'border-0',
                    },
                    {
                      id: 'glass',
                      label: 'زجاجي شفاف',
                      sub: 'تأثير زجاجي مصنفر ولمعان',
                      icon: '🧊',
                      previewBg: 'bg-white/20 backdrop-blur-md',
                      previewBorder: 'border-2 border-white/70',
                    },
                    {
                      id: 'polished',
                      label: 'مصقول فاخر',
                      sub: 'حواف مصقولة ببريق ذهبي ناعم',
                      icon: '✨',
                      previewBg: 'bg-[#2F2B28]',
                      previewBorder: 'border-2 border-[#D9C1A7] ring-2 ring-[#C6A36A]/40',
                    },
                    {
                      id: 'gold_luxury',
                      label: 'ذهبي ملكي',
                      sub: 'إطار ذهبي صريح بارز',
                      icon: '👑',
                      previewBg: 'bg-[#2F2B28]',
                      previewBorder: 'border-2 border-[#C6A36A]',
                    },
                    {
                      id: 'floating_glow',
                      label: 'توهج عائم',
                      sub: 'هالة ضوئية ذهبية مشعة',
                      icon: '💫',
                      previewBg: 'bg-[#2F2B28]',
                      previewBorder: 'border border-[#C6A36A]/70 shadow-[0_0_12px_rgba(198,163,106,0.5)]',
                    },
                    {
                      id: 'subtle_card',
                      label: 'بطاقة نقية',
                      sub: 'إطار أبيض ناصع كلاسيكي',
                      icon: '🃏',
                      previewBg: 'bg-[#2F2B28]',
                      previewBorder: 'border-3 border-white',
                    },
                    {
                      id: 'vintage_bevel',
                      label: 'مشطوف فاخر',
                      sub: 'إطار مزدوج مشطوف كلاسيكي',
                      icon: '🏛️',
                      previewBg: 'bg-[#2F2B28]',
                      previewBorder: 'border-3 border-[#F4ECE2] ring-1 ring-[#8A7465]/40',
                    },
                  ].map((style) => {
                    const isSelected = (slide.banner_border_style || 'subtle_card') === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSlide((prev) => ({ ...prev, banner_border_style: style.id as any }))}
                        className={`p-2.5 rounded-[14px] text-right transition-all border flex flex-col justify-between gap-1.5 cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'border-[#2F2B28] bg-[#2F2B28] text-white shadow-md ring-2 ring-[#C6A36A]'
                            : 'border-[#E7D4BC] bg-white text-[#2F2B28] hover:border-[#C6A36A]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-xs flex items-center gap-1.5">
                            <span>{style.icon}</span>
                            <span>{style.label}</span>
                          </span>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#C6A36A] bg-[#C6A36A]' : 'border-current'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-[#2F2B28]" />}
                          </div>
                        </div>

                        {/* Visual Micro Preview Box */}
                        <div className="w-full h-8 rounded-[8px] bg-[#1E1B19] p-1 flex items-center justify-center my-0.5">
                          <div className={`w-full h-full rounded-[6px] ${style.previewBg} ${style.previewBorder} flex items-center justify-center`}>
                            <span className="text-[9px] text-[#C6A36A] font-bold">عينة</span>
                          </div>
                        </div>

                        <span className={`text-[10px] leading-tight block ${isSelected ? 'text-[#E7D4BC]' : 'text-[#7C736D]'}`}>
                          {style.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B. Border Radius & C. Shadow Depth Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Border Radius */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>استدارة الحواف (Corner Radius):</span>
                    </label>
                    <span className="px-2 py-0.5 bg-[#F4ECE2] text-[#6F584A] rounded-full text-[10px] font-mono font-bold">
                      {slide.banner_border_radius === 'none'
                        ? '0px (حادة مستقيمة)'
                        : slide.banner_border_radius === 'sm'
                        ? '8px (خفيفة)'
                        : slide.banner_border_radius === 'md'
                        ? '16px (متوسطة)'
                        : slide.banner_border_radius === 'pill'
                        ? '36px (دائرية فائقة)'
                        : '24px (عريضة حديثة)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'none', label: 'حادة 0px', icon: '📐' },
                      { id: 'sm', label: 'ناعمة 8px', icon: '🔲' },
                      { id: 'md', label: 'متوسطة 16px', icon: '🔘' },
                      { id: 'lg', label: 'عريضة 24px', icon: '⭕' },
                      { id: 'pill', label: 'دائرية 36px', icon: '💊' },
                    ].map((radius) => {
                      const isSelected = (slide.banner_border_radius || 'lg') === radius.id;
                      return (
                        <button
                          key={radius.id}
                          type="button"
                          onClick={() => setSlide((prev) => ({ ...prev, banner_border_radius: radius.id as any }))}
                          className={`p-2 rounded-[10px] text-center border text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-[#2F2B28] text-white border-[#2F2B28] ring-2 ring-[#C6A36A]'
                              : 'bg-[#FBF8F3] text-[#2F2B28] border-[#E7D4BC] hover:bg-[#F4ECE2]'
                          }`}
                        >
                          <span className="text-xs">{radius.icon}</span>
                          <span className="truncate">{radius.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Shadow & Elevation */}
                <div className="bg-white p-3.5 rounded-[16px] border border-[#E7D4BC] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>الظلال والعمق (Elevation & Shadow):</span>
                    </label>
                    <span className="px-2 py-0.5 bg-[#F4ECE2] text-[#6F584A] rounded-full text-[10px] font-mono font-bold">
                      {slide.banner_shadow_style === 'none'
                        ? 'بدون ظل (Flat)'
                        : slide.banner_shadow_style === 'soft'
                        ? 'ظل خفيف (Soft)'
                        : slide.banner_shadow_style === 'golden_glow'
                        ? 'هالة ذهبية (Gold Aura)'
                        : 'ظل عميق 3D (Deep)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'none', label: 'مسطح Flat', icon: '◽' },
                      { id: 'soft', label: 'ظل ناعم Soft', icon: '☁️' },
                      { id: 'deep', label: 'عميق 3D Deep', icon: '🕶️' },
                      { id: 'golden_glow', label: 'هالة ذهبية Gold', icon: '🌟' },
                    ].map((shadow) => {
                      const isSelected = (slide.banner_shadow_style || 'deep') === shadow.id;
                      return (
                        <button
                          key={shadow.id}
                          type="button"
                          onClick={() => setSlide((prev) => ({ ...prev, banner_shadow_style: shadow.id as any }))}
                          className={`p-2 rounded-[10px] text-center border text-[10px] font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-[#2F2B28] text-white border-[#2F2B28] ring-2 ring-[#C6A36A]'
                              : 'bg-[#FBF8F3] text-[#2F2B28] border-[#E7D4BC] hover:bg-[#F4ECE2]'
                          }`}
                        >
                          <span className="text-xs">{shadow.icon}</span>
                          <span className="truncate">{shadow.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
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
