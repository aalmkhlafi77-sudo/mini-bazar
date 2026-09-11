import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Link2,
  Loader2,
} from 'lucide-react';
import { imageUploadService, inspectImageContent } from '../services/imageUploadService';

export interface ImageUploaderProps {
  label: string;
  value?: string;
  currentImageUrl?: string;
  onChange?: (imageUrl: string) => void;
  onImageChange?: (imageUrl: string) => void;
  aspectRatio?: 'square' | 'wide' | 'tall' | 'circle';
  aspectRatioHint?: string;
  maxDimension?: number;
  quality?: number;
  helpText?: string;
  imageFit?: 'cover' | 'contain' | 'full_width';
  onImageFitChange?: (fit: 'cover' | 'contain' | 'full_width') => void;
  folder?: 'products' | 'hero' | 'categories' | 'brands' | 'general' | 'receipts' | 'logo';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  currentImageUrl,
  onChange,
  onImageChange,
  aspectRatio = 'square',
  aspectRatioHint,
  maxDimension = 1400,
  quality = 0.85,
  helpText = 'اختر صورة من جهازك أو من معرض الجوال، أو التقطها مباشرة بالكاميرا الخلفية.',
  imageFit,
  onImageFitChange,
  folder = 'general',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [localFit, setLocalFit] = useState<'cover' | 'contain' | 'full_width'>(imageFit || 'cover');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [instantPreview, setInstantPreview] = useState<string | null>(null);

  // Active image: prioritize controlled value, then currentImageUrl
  const activeImage = value !== undefined ? value : currentImageUrl || '';
  const currentFit = imageFit || localFit;
  const displayImage = instantPreview || activeImage;

  // Reset image load error whenever the active image changes
  useEffect(() => {
    setImageLoadError(false);
  }, [activeImage]);

  // Detect whether the current image is an un-uploaded local preview (Base64/blob)
  const isLocalPreview =
    Boolean(displayImage) &&
    (displayImage.startsWith('data:') || displayImage.startsWith('blob:'));

  // Keep local fit in sync with prop if prop changes
  useEffect(() => {
    if (imageFit) {
      setLocalFit(imageFit);
    }
  }, [imageFit]);

  const handleFitChange = (newFit: 'cover' | 'contain' | 'full_width') => {
    setLocalFit(newFit);
    if (onImageFitChange) {
      onImageFitChange(newFit);
    }
  };

  const triggerChange = (newUrl: string) => {
    if (onChange) {
      onChange(newUrl);
    }
    if (onImageChange) {
      onImageChange(newUrl);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    // 1. File size limit guard (5 MB Max)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        text: 'حجم ملف الصورة يتجاوز الحد الأقصى المسموح به (5 ميجابايت).',
        type: 'error',
      });
      return;
    }

    // 2. Inspect both file metadata and raw binary magic bytes (do not rely on extension alone)
    const inspection = await inspectImageContent(file);
    if (!inspection.valid) {
      setStatusMessage({
        text: inspection.error || 'نوع الملف أو محتواه غير مدعوم. الصيغ المدعومة هي: JPEG, PNG, WebP, GIF فقط.',
        type: 'error',
      });
      return;
    }

    // Immediately create local object URL for instant, flicker-free preview
    const localBlobUrl = URL.createObjectURL(file);
    setInstantPreview(localBlobUrl);
    setImageLoadError(false);
    setIsProcessing(true);
    setUploadProgress(20);
    setStatusMessage(null);

    try {
      const res = await imageUploadService.upload(file, {
        folder,
        maxDimension,
        quality,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      if (res.success && res.url) {
        // Keep the selected image in the form model for instant preview
        triggerChange(res.url);

        if (res.isPermanent) {
          setStatusMessage({
            text: 'تم رفع الصورة وتخزينها بنجاح',
            type: 'success',
          });
          setTimeout(() => setStatusMessage(null), 4000);
        } else {
          // Explicit Arabic status required in template stage
          setStatusMessage({
            text: 'تم اختيار الصورة ومعاينتها، لكن يلزم إعداد خدمة التخزين قبل الحفظ النهائي',
            type: 'warning',
          });
        }
      } else {
        setStatusMessage({
          text: res.error || 'تعذر معالجة ملف الصورة',
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'فشلت معالجة ملف الصورة',
        type: 'error',
      });
    } finally {
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
      setInstantPreview(null);
      setIsProcessing(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyUrl = () => {
    const clean = directUrl.trim();
    if (!clean) return;

    // 1. Explicitly reject SVG
    if (clean.toLowerCase().includes('.svg') || clean.toLowerCase().includes('image/svg')) {
      setStatusMessage({
        text: 'صيغة SVG غير مدعومة نهائياً لأسباب أمنية وتوافقية. يرجى استخدام صور JPEG أو PNG أو WebP أو GIF.',
        type: 'error',
      });
      return;
    }

    // 2. Explicitly reject BMP, HEIC, HEIF
    if (
      /\.(bmp|dib|heic|heif|heics|heifs)(\?|$)/i.test(clean) ||
      clean.toLowerCase().includes('image/bmp') ||
      clean.toLowerCase().includes('image/heic')
    ) {
      setStatusMessage({
        text: 'صيغ BMP و HEIC و HEIF غير مدعومة حالياً لأنها غير مدعومة بشكل قياسي عبر جميع المتصفحات أو محرّك Canvas. يرجى استخدام أو تحويل الصورة إلى JPEG أو PNG أو WebP.',
        type: 'error',
      });
      return;
    }

    // 3. Prevent pasting local Base64 / blob URLs directly
    if (clean.startsWith('data:') || clean.startsWith('blob:')) {
      setStatusMessage({
        text: 'لا يُسمح بإدخال روابط مؤقتة Base64 أو Blob كرابط دائم.',
        type: 'error',
      });
      return;
    }

    triggerChange(clean);
    setDirectUrl('');
    setShowUrlInput(false);
    setStatusMessage({
      text: 'تم تطبيق رابط الصورة الخارجي بنجاح',
      type: 'success',
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'circle':
        return 'w-24 h-24 sm:w-28 sm:h-28 rounded-full';
      case 'wide':
        return 'w-full max-w-[260px] aspect-16/9 rounded-[16px]';
      case 'tall':
        return 'w-28 sm:w-32 aspect-3/4 rounded-[16px]';
      case 'square':
      default:
        return 'w-28 h-28 sm:w-32 sm:h-32 rounded-[16px]';
    }
  };

  return (
    <div className="space-y-2.5 text-right font-sans w-full min-w-0" dir="rtl">
      {/* Label and Secondary URL Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="text-xs font-bold text-[#2F2B28] block shrink-0">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#C6A36A] hover:text-[#2F2B28] font-semibold transition-colors shrink-0 flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          <span>{showUrlInput ? 'إخفاء خيار الرابط' : 'أو استخدام رابط URL خارجي (اختياري)'}</span>
        </button>
      </div>

      {/* Secondary URL Input (Collapsed by default) */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-[#FBF8F3] border border-[#E7D4BC] rounded-[12px] animate-in fade-in w-full">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyUrl())}
            className="flex-1 min-w-0 bg-white border border-[#D9C1A7] rounded-[8px] p-2 text-xs text-[#2F2B28] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold rounded-[8px] transition-colors shrink-0"
          >
            تطبيق
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-2 text-[#7C736D] hover:text-[#2F2B28] transition-colors shrink-0"
            title="إلغاء"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-3.5 sm:p-4 bg-[#FBF8F3] border-2 border-dashed ${
          isDragging
            ? 'border-[#C6A36A] bg-[#F7F1E8]'
            : 'border-[#D9C1A7] hover:border-[#C6A36A]'
        } rounded-[20px] transition-all flex flex-col md:flex-row items-center md:items-start gap-4 w-full min-w-0`}
      >
        {/* Visual Preview Container */}
        <div className="relative shrink-0 flex items-center justify-center">
          {displayImage && displayImage.trim() !== '' ? (
            <div
              className={`relative overflow-hidden bg-white border border-[#E7D4BC] shadow-xs flex items-center justify-center ${getAspectClass()}`}
            >
              {imageLoadError ? (
                <div className="flex flex-col items-center justify-center p-2 text-center text-[#8A7465] w-full h-full bg-[#FAF5EE]">
                  <AlertCircle className="w-6 h-6 text-[#B4574A] mb-1 shrink-0" />
                  <span className="text-[10px] font-bold text-[#6F584A]">الصورة غير متاحة</span>
                  <span className="text-[9px] text-[#A8988B] mt-0.5">انقر لاختيار صورة أخرى</span>
                </div>
              ) : (
                <img
                  src={displayImage}
                  alt="معاينة الصورة"
                  onError={() => {
                    if (!instantPreview) {
                      setImageLoadError(true);
                    }
                  }}
                  onLoad={() => setImageLoadError(false)}
                  className={`w-full h-full transition-all ${
                    currentFit === 'contain'
                      ? 'object-contain p-1.5'
                      : currentFit === 'full_width'
                      ? 'object-cover scale-x-105'
                      : 'object-cover'
                  } object-center`}
                />
              )}

              {/* Progress & Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-[#2F2B28]/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20 px-2 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#E5C483] mb-1.5" />
                  <span className="text-[11px] font-bold">
                    {uploadProgress ? `جارٍ الرفع ${uploadProgress}%` : 'جارٍ المعالجة...'}
                  </span>
                </div>
              )}

              {/* Remove Button */}
              {!isProcessing && (
                <button
                  type="button"
                  onClick={() => {
                    if (instantPreview) {
                      URL.revokeObjectURL(instantPreview);
                      setInstantPreview(null);
                    }
                    setImageLoadError(false);
                    triggerChange('');
                    setStatusMessage(null);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-90 z-20"
                  title="إزالة الصورة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div
              className={`bg-[#F4ECE2] border border-[#E7D4BC] flex flex-col items-center justify-center text-[#8A7465] ${getAspectClass()}`}
            >
              <ImageIcon className="w-7 h-7 text-[#C6A36A] mb-1 opacity-80" />
              <span className="text-[10px] text-center font-medium">لا توجد صورة</span>
            </div>
          )}
        </div>

        {/* Upload Action Buttons and Controls */}
        <div className="flex-1 space-y-3 w-full min-w-0">
          {/* Hidden Native File Inputs */}
          {/* 1. Device / Gallery Picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
          />
          {/* 2. Mobile Rear Camera Picker */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Button 1: Device / Gallery */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = '';
                fileInputRef.current?.click();
              }}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 shrink-0"
              title="اختيار صورة من الكمبيوتر أو من ألبوم صور الجوال"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 text-[#C6A36A] animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-[#C6A36A]" />
              )}
              <span>
                {isProcessing
                  ? uploadProgress !== null
                    ? `جاري المعالجة (${uploadProgress}%)...`
                    : 'جاري المعالجة...'
                  : 'اختيار من الجهاز / المعرض'}
              </span>
            </button>

            {/* Button 2: Rear Mobile Camera */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (cameraInputRef.current) cameraInputRef.current.value = '';
                cameraInputRef.current?.click();
              }}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-[12px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#2F2B28] text-xs font-bold border border-[#D9C1A7] shadow-2xs active:scale-95 transition-all disabled:opacity-50 shrink-0"
              title="التقاط صورة فورية بالكاميرا الخلفية للهاتف"
            >
              <Camera className="w-4 h-4 text-[#C6A36A]" />
              <span>التقاط بالكاميرا</span>
            </button>
          </div>

          {/* Image Fit Controls (Contain / Cover / Full Width) */}
          {activeImage && activeImage.trim() !== '' && (
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-[12px] border border-[#E7D4BC] text-[11px] w-fit">
              <span className="text-[#7C736D] px-1 font-bold text-[10px]">عرض الصورة:</span>
              <button
                type="button"
                onClick={() => handleFitChange('contain')}
                className={`px-2.5 py-1 rounded-[8px] font-bold text-[10px] transition-all ${
                  currentFit === 'contain'
                    ? 'bg-[#2F2B28] text-white shadow-xs'
                    : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                }`}
                title="احتواء كامل للصورة دون أي قص"
              >
                احتواء (Contain)
              </button>
              <button
                type="button"
                onClick={() => handleFitChange('cover')}
                className={`px-2.5 py-1 rounded-[8px] font-bold text-[10px] transition-all ${
                  currentFit === 'cover'
                    ? 'bg-[#2F2B28] text-white shadow-xs'
                    : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                }`}
                title="ملء الإطار بالكامل"
              >
                ملء (Cover)
              </button>
              <button
                type="button"
                onClick={() => handleFitChange('full_width')}
                className={`px-2.5 py-1 rounded-[8px] font-bold text-[10px] transition-all ${
                  currentFit === 'full_width'
                    ? 'bg-[#2F2B28] text-white shadow-xs'
                    : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                }`}
                title="عرض أفقي كامل"
              >
                أفقي (Full Width)
              </button>
            </div>
          )}

          {/* Explicit Preview Notice / Warning when image is a transient local preview */}
          {isLocalPreview && (
            <div className="p-2.5 rounded-[12px] bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px] leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  تم اختيار الصورة ومعاينتها، لكن يلزم إعداد خدمة التخزين قبل الحفظ النهائي.
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  الصورة تظهر للمعاينة فقط في المتصفح. لمنع تضخم قاعدة البيانات، لن يتم حفظ Base64 في التخزين الدائم حتى ربط خادم رفع مخصص أو إدخال رابط خارجي.
                </span>
              </div>
            </div>
          )}

          {/* Dynamic Status Messages */}
          {statusMessage && !isLocalPreview && (
            <div
              className={`text-[11px] flex items-center gap-1.5 font-semibold ${
                statusMessage.type === 'success'
                  ? 'text-emerald-700'
                  : statusMessage.type === 'warning'
                  ? 'text-amber-800'
                  : 'text-red-600'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'warning' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Hints & Help */}
          <div className="space-y-0.5">
            {aspectRatioHint && (
              <p className="text-[11px] text-[#C6A36A] font-bold">
                {aspectRatioHint}
              </p>
            )}
            <p className="text-[11px] text-[#7C736D] leading-relaxed">
              {helpText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
