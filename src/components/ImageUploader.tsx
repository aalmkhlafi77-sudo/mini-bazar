import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Check, RefreshCw } from 'lucide-react';

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
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  currentImageUrl,
  onChange,
  onImageChange,
  aspectRatio = 'square',
  aspectRatioHint,
  maxDimension = 1000,
  quality = 0.82,
  helpText = 'يدعم صيغ JPG و PNG و WebP مع تحسين فوري للأبعاد وضغط سحابي فائق الجودة لحفظ قاعدة البيانات.',
  imageFit,
  onImageFitChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [localFit, setLocalFit] = useState<'cover' | 'contain' | 'full_width'>('contain');

  // Active image and active fit
  const activeImage = value !== undefined ? value : currentImageUrl || '';
  const currentFit = imageFit || localFit;

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

  const processAndResizeFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    const finishSuccess = (dataUrl: string) => {
      triggerChange(dataUrl);
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const finishError = (err?: any) => {
      console.warn('Image processing fallback:', err);
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => finishError('FileReader error');
    reader.onload = (event) => {
      const rawResult = event.target?.result as string;
      if (!rawResult) {
        finishError('Empty result');
        return;
      }

      // If SVG, keep as is
      if (file.type === 'image/svg+xml') {
        finishSuccess(rawResult);
        return;
      }

      try {
        const img = new Image();
        img.onerror = () => finishSuccess(rawResult);
        img.onload = () => {
          try {
            let width = img.width || 800;
            let height = img.height || 800;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              finishSuccess(rawResult);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Prefer modern high-efficiency WebP which supports transparency and 80%+ smaller size
            let outputType = 'image/webp';
            let optimizedDataUrl = canvas.toDataURL(outputType, quality);

            // Fallback to JPEG if WebP produced invalid or empty
            if (!optimizedDataUrl.startsWith('data:image/webp')) {
              outputType = 'image/jpeg';
              optimizedDataUrl = canvas.toDataURL(outputType, quality);
            }

            // Guard against exceeding Firestore limits: if still large (> 300KB), downscale
            if (optimizedDataUrl.length > 400000) {
              const targetMax = Math.min(800, maxDimension);
              let w2 = width > height ? targetMax : Math.round((width * targetMax) / height);
              let h2 = width > height ? Math.round((height * targetMax) / width) : targetMax;
              const c2 = document.createElement('canvas');
              c2.width = w2;
              c2.height = h2;
              const ctx2 = c2.getContext('2d');
              if (ctx2) {
                ctx2.drawImage(img, 0, 0, w2, h2);
                optimizedDataUrl = c2.toDataURL(outputType, 0.75);
              }
            }

            finishSuccess(optimizedDataUrl);
          } catch (canvasErr) {
            finishSuccess(rawResult);
          }
        };
        img.src = rawResult;
      } catch (err) {
        finishSuccess(rawResult);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndResizeFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndResizeFile(file);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'circle':
        return 'w-24 h-24 rounded-full';
      case 'wide':
        return 'w-full aspect-16/9 rounded-[16px]';
      case 'tall':
        return 'w-full aspect-3/4 rounded-[16px]';
      case 'square':
      default:
        return 'w-28 h-28 sm:w-32 sm:h-32 rounded-[16px]';
    }
  };

  return (
    <div className="space-y-2.5 text-right font-sans w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="text-xs font-bold text-[#2F2B28] block shrink-0">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#C6A36A] hover:text-[#2F2B28] font-semibold transition-colors shrink-0"
        >
          {showUrlInput ? 'إخفاء الرابط المباشر' : 'أو إدخال رابط URL مباشر'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 mb-2 animate-in fade-in w-full">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="flex-1 min-w-0 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] p-2 text-xs text-[#2F2B28] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => {
              if (directUrl.trim()) {
                triggerChange(directUrl.trim());
                setDirectUrl('');
                setShowUrlInput(false);
              }
            }}
            className="px-3.5 py-2 bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold rounded-[10px] shadow-xs transition-colors shrink-0"
          >
            تطبيق
          </button>
        </div>
      )}

      {/* Main Drag & Drop / Preview Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="p-3.5 sm:p-4 bg-[#FBF8F3] border-2 border-dashed border-[#D9C1A7] hover:border-[#C6A36A] rounded-[20px] transition-colors flex flex-col md:flex-row items-center md:items-start gap-4 w-full min-w-0 overflow-hidden"
      >
        {/* Visual Preview */}
        <div className="relative shrink-0 flex items-center justify-center">
          {activeImage ? (
            <div
              className={`relative overflow-hidden bg-white border border-[#E7D4BC] shadow-xs flex items-center justify-center ${getAspectClass()}`}
            >
              <img
                src={activeImage}
                alt="معاينة الصورة"
                className={`w-full h-full transition-all ${
                  currentFit === 'contain'
                    ? 'object-contain p-1.5'
                    : currentFit === 'full_width'
                    ? 'object-cover scale-x-105'
                    : 'object-cover'
                } object-center`}
              />
              <button
                type="button"
                onClick={() => triggerChange('')}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-md transition-transform active:scale-90"
                title="إزالة الصورة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
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

        {/* Upload Controls & Formatting Tools */}
        <div className="flex-1 space-y-2.5 w-full min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 shrink-0"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 text-[#C6A36A] animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-[#C6A36A]" />
              )}
              <span>{isProcessing ? 'جاري معالجة الصورة...' : 'رفع صورة من جهازك'}</span>
            </button>

            {activeImage && (
              <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-[10px] border border-[#E7D4BC] text-[11px]">
                <span className="text-[#7C736D] px-1 font-medium text-[10px]">العرض:</span>
                <button
                  type="button"
                  onClick={() => handleFitChange('contain')}
                  className={`px-2 py-0.5 rounded-[6px] font-semibold text-[10px] transition-all ${
                    currentFit === 'contain'
                      ? 'bg-[#2F2B28] text-white shadow-xs'
                      : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                  }`}
                  title="ظهور كامل للصورة بدون أي قص للأطراف"
                >
                  كامل (Contain)
                </button>
                <button
                  type="button"
                  onClick={() => handleFitChange('cover')}
                  className={`px-2 py-0.5 rounded-[6px] font-semibold text-[10px] transition-all ${
                    currentFit === 'cover'
                      ? 'bg-[#2F2B28] text-white shadow-xs'
                      : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                  }`}
                  title="تمدد يملأ المساحة بالكامل"
                >
                  ملء (Cover)
                </button>
                <button
                  type="button"
                  onClick={() => handleFitChange('full_width')}
                  className={`px-2 py-0.5 rounded-[6px] font-semibold text-[10px] transition-all ${
                    currentFit === 'full_width'
                      ? 'bg-[#2F2B28] text-white shadow-xs'
                      : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
                  }`}
                  title="عرض أفقي كامل بدون تقييد الحواف"
                >
                  أفقي (Full Width)
                </button>
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            {aspectRatioHint && (
              <p className="text-[11px] text-[#C6A36A] font-semibold">
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
