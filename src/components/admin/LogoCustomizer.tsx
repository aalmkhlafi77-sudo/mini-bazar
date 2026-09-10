import React from 'react';
import { Sparkles, RotateCcw, Check, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ImageUploader } from '../ImageUploader';
import { MiniBazaarLogo } from '../MiniBazaarLogo';

export const LogoCustomizer: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();

  const handleLogoChange = (url: string) => {
    updateStoreSettings({ custom_logo_url: url });
  };

  const handleResetToDefault = () => {
    updateStoreSettings({ custom_logo_url: undefined });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#C6A36A]" />
            <h3 className="text-base font-bold text-[#2F2B28] font-heading">
              شعار المتجر والأيقونة الرسمية (Store Logo)
            </h3>
          </div>
          <p className="text-xs text-[#7C736D]">
            يمكنك رفع شعار خاص بمتجرك مباشرة من جهازك مع ضغط الحجم والتنسيق تلقائياً ليناسب إطار الموقع، أو الإبقاء على الشعار الأصلي لميني بازار.
          </p>
        </div>

        {storeSettings.custom_logo_url && (
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#2F2B28] text-xs font-semibold transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الشعار الأصلي</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Control */}
        <div className="lg:col-span-7">
          <ImageUploader
            value={storeSettings.custom_logo_url || ''}
            onChange={handleLogoChange}
            label="رفع صورة الشعار من الكمبيوتر أو معرض الجوال أو الكاميرا (يدعم PNG, JPG, WebP, SVG)"
            aspectRatioHint="يفضل شعار مربع أو دائري بنسبة 1:1 أو خلفية شفافة"
            maxDimension={600}
            quality={0.9}
            folder="logo"
          />
        </div>

        {/* Live Preview Box */}
        <div className="lg:col-span-5 bg-[#FBF8F3] p-5 rounded-[20px] border border-[#E7D4BC] space-y-4 text-right">
          <span className="text-xs font-bold text-[#6F584A] block">
            معاينة حية لظهور الشعار في واجهات المتجر:
          </span>

          {/* Light Header preview */}
          <div className="p-3.5 rounded-[14px] bg-white border border-[#E5D8C9] shadow-2xs">
            <span className="text-[10px] text-[#8A7465] font-semibold block mb-2">
              في الهيدر والشريط العلوي:
            </span>
            <div className="flex items-center justify-between">
              <MiniBazaarLogo variant="compact" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4ECE2] text-[#6F584A]">
                معاينة الهيدر
              </span>
            </div>
          </div>

          {/* Dark Footer preview */}
          <div className="p-3.5 rounded-[14px] bg-[#2F2B28] text-white border border-[#4A3E37] shadow-2xs">
            <span className="text-[10px] text-[#C4B7AC] font-semibold block mb-2">
              في الفوتر وأسفل المتجر:
            </span>
            <div className="flex items-center justify-between">
              <MiniBazaarLogo variant="full" inverted={true} />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D3733] text-[#C6A36A]">
                معاينة الفوتر
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#607866] font-medium pt-1">
            <Check className="w-3.5 h-3.5 text-[#607866]" />
            <span>
              {storeSettings.custom_logo_url
                ? 'يتم الآن استخدام الشعار المخصص المرفوع'
                : 'يتم حالياً استخدام الشعار الملكي الافتراضي لميني بازار'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
