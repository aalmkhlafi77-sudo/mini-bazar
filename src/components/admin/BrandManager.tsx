import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  ExternalLink,
  Package,
  Award,
  Sliders,
  Eye,
  LayoutGrid,
  Image as ImageIcon,
  Type,
  Maximize2,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Brand, BrandDisplayMode, BrandLogoSize, BrandSettings } from '../../types';
import { ImageUploader } from '../ImageUploader';
import { imageUploadService } from '../../services/imageUploadService';

interface BrandManagerProps {
  onSuccess: (message?: string) => void;
}

export const BrandManager: React.FC<BrandManagerProps> = ({ onSuccess }) => {
  const {
    brands,
    saveBrand,
    deleteBrand,
    products,
    storeSettings,
    updateStoreSettings,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Brand Settings State (synced with storeSettings.brand_settings)
  const [localSettings, setLocalSettings] = useState<BrandSettings>(() => {
    return (
      storeSettings?.brand_settings || {
        display_mode: 'both',
        logo_size: 'medium',
        show_product_count: true,
        show_on_product_card: true,
        show_in_product_modal: true,
        show_filter_bar: true,
        filter_title_ar: 'تصفية بحسب العلامة التجارية (البراند):',
        badge_style: 'luxury',
      }
    );
  });

  const [previewSelectedBrandId, setPreviewSelectedBrandId] = useState<string | null>(
    brands[0]?.id || null
  );
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [brandStorageNotice, setBrandStorageNotice] = useState<string | null>(null);

  const filteredBrands = brands.filter(
    (b) =>
      b.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setBrandStorageNotice(null);
    setEditingBrand({
      id: `brand-${Date.now()}`,
      name_ar: '',
      name_en: '',
      slug: '',
      description_ar: '',
      description_en: '',
      logo_path: '',
      sort_order: brands.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setBrandStorageNotice(null);
    setEditingBrand({ ...brand });
    setIsModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandStorageNotice(null);
    if (!editingBrand || !editingBrand.name_ar.trim()) return;

    // Strict Guard: Prevent saving brand if logo is an un-uploaded local preview
    const validation = imageUploadService.validateRecordImages([editingBrand.logo_path]);
    if (!validation.canSave) {
      setBrandStorageNotice(
        validation.message || 'تم اختيار الصورة ومعاينتها، لكن يلزم إعداد خدمة التخزين قبل الحفظ النهائي'
      );
      return;
    }

    // Auto-generate slug if empty
    let cleanSlug = editingBrand.slug.trim();
    if (!cleanSlug) {
      cleanSlug = (editingBrand.name_en || editingBrand.name_ar)
        .toLowerCase()
        .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const payload: Brand = {
      ...editingBrand,
      slug: cleanSlug || `brand-${Date.now()}`,
      name_ar: editingBrand.name_ar.trim(),
      name_en: editingBrand.name_en.trim(),
    };

    saveBrand(payload);
    setIsModalOpen(false);
    setEditingBrand(null);
    onSuccess('تم حفظ بيانات العلامة التجارية بنجاح');
  };

  const handleDeleteBrand = (brand: Brand) => {
    const linkedCount = products.filter((p) => p.brand_id === brand.id).length;
    let message = `هل أنت متأكد من حذف العلامة التجارية "${brand.name_ar}"؟`;
    if (linkedCount > 0) {
      message += `\n⚠️ تنبيه: هناك (${linkedCount}) منتجات مرتبطة بهذا البراند حالياً.`;
    }

    if (confirm(message)) {
      deleteBrand(brand.id);
      onSuccess('تم حذف العلامة التجارية بنجاح');
    }
  };

  // Save Settings to Global Store
  const handleSaveDisplaySettings = () => {
    updateStoreSettings({
      brand_settings: {
        ...localSettings,
      },
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
    onSuccess('تم حفظ وتحديث إعدادات عرض العلامات التجارية في المتجر والمعرض');
  };

  // Helper for size classes
  const getLogoSizeClass = (size: BrandLogoSize) => {
    switch (size) {
      case 'small':
        return 'w-6 h-6 rounded-[8px]';
      case 'large':
        return 'w-11 h-11 sm:w-12 sm:h-12 rounded-[14px]';
      case 'medium':
      default:
        return 'w-8 h-8 sm:w-9 sm:h-9 rounded-[10px]';
    }
  };

  return (
    <div className="space-y-8 text-right">
      {/* 1. BRAND DISPLAY & CUSTOMIZATION SETTINGS PANEL */}
      <div className="bg-white p-6 sm:p-7 rounded-[26px] border border-[#E5D8C9] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5D8C9]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-5 h-5 text-[#C6A36A]" />
              <h3 className="text-base sm:text-lg font-bold text-[#2F2B28] font-heading">
                تخصيص وإعدادات مظهر العلامات التجارية (البراندات) في المعرض
              </h3>
            </div>
            <p className="text-xs text-[#7C736D]">
              تحكم بدقة في طريقة عرض الشعار والاسم وحجم الأيقونات في واجهة المتجر وبطاقات المنتجات.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDisplaySettings}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs transition-all border border-[#4A3E37]"
            >
              <Save className="w-4 h-4 text-[#C6A36A]" />
              <span>حفظ الإعدادات والمظهر</span>
            </button>
          </div>
        </div>

        {/* Display Mode Selection */}
        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#2F2B28] mb-2.5">
              1. نمط إظهار العلامة التجارية (صورة فقط، اسم فقط، أو كلاهما):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Option: Both */}
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, display_mode: 'both' })}
                className={`p-4 rounded-[18px] border text-right transition-all flex flex-col justify-between ${
                  localSettings.display_mode === 'both'
                    ? 'bg-[#FBF8F3] border-[#C6A36A] ring-2 ring-[#C6A36A]/20 shadow-xs'
                    : 'bg-white border-[#E5D8C9] hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#2F2B28]">شعار واسم معاً (موصى به)</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      localSettings.display_mode === 'both'
                        ? 'border-[#C6A36A] bg-[#C6A36A]'
                        : 'border-[#D9C1A7]'
                    }`}
                  >
                    {localSettings.display_mode === 'both' && (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#7C736D] leading-relaxed mb-3">
                  عرض شعار العلامة بحجم واضح وأنيق بجانب الاسم العربي وعدد المنتجات.
                </p>
                <div className="flex items-center gap-2 p-2 rounded-[10px] bg-white border border-[#E7D4BC] self-start">
                  <div className="w-5 h-5 rounded-[4px] bg-[#2F2B28] text-white flex items-center justify-center text-[9px] font-bold">
                    CH
                  </div>
                  <span className="text-[11px] font-bold text-[#2F2B28]">شانيل (CHANEL)</span>
                </div>
              </button>

              {/* Option: Logo Only */}
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, display_mode: 'logo_only' })}
                className={`p-4 rounded-[18px] border text-right transition-all flex flex-col justify-between ${
                  localSettings.display_mode === 'logo_only'
                    ? 'bg-[#FBF8F3] border-[#C6A36A] ring-2 ring-[#C6A36A]/20 shadow-xs'
                    : 'bg-white border-[#E5D8C9] hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#2F2B28]">الشعار والصورة فقط</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      localSettings.display_mode === 'logo_only'
                        ? 'border-[#C6A36A] bg-[#C6A36A]'
                        : 'border-[#D9C1A7]'
                    }`}
                  >
                    {localSettings.display_mode === 'logo_only' && (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#7C736D] leading-relaxed mb-3">
                  عرض أيقونة أو صورة الشعار فقط مع تلميح بالاسم (مظهر بصري خالص ومودرن).
                </p>
                <div className="flex items-center gap-2 p-1.5 rounded-[12px] bg-white border border-[#E7D4BC] self-start">
                  <div className="w-7 h-7 rounded-[8px] bg-[#2F2B28] text-white flex items-center justify-center text-[10px] font-bold">
                    CH
                  </div>
                  <span className="text-[10px] px-1 bg-[#F4ECE2] text-[#6F584A] rounded-full font-bold">
                    8
                  </span>
                </div>
              </button>

              {/* Option: Name Only */}
              <button
                type="button"
                onClick={() => setLocalSettings({ ...localSettings, display_mode: 'name_only' })}
                className={`p-4 rounded-[18px] border text-right transition-all flex flex-col justify-between ${
                  localSettings.display_mode === 'name_only'
                    ? 'bg-[#FBF8F3] border-[#C6A36A] ring-2 ring-[#C6A36A]/20 shadow-xs'
                    : 'bg-white border-[#E5D8C9] hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#2F2B28]">الاسم النصي فقط</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      localSettings.display_mode === 'name_only'
                        ? 'border-[#C6A36A] bg-[#C6A36A]'
                        : 'border-[#D9C1A7]'
                    }`}
                  >
                    {localSettings.display_mode === 'name_only' && (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#7C736D] leading-relaxed mb-3">
                  عرض أسماء البراندات بنصوص واضحة وأنيقة بدون أيقونات أو صور.
                </p>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-white border border-[#E7D4BC] self-start">
                  <span className="text-[11px] font-bold text-[#2F2B28]">شانيل (CHANEL)</span>
                  <span className="text-[10px] px-1 bg-[#F4ECE2] text-[#6F584A] rounded-full font-bold">
                    8
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Logo Size Selection */}
          <div>
            <label className="block text-xs font-bold text-[#2F2B28] mb-2.5">
              2. حجم حقل الشعار والصورة (Logo Size):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'small',
                  label: 'صغير مدمج (24px)',
                  desc: 'أيقونة ناعمة ومدمجة تناسب الشاشات الصغيرة',
                  iconSize: 'w-6 h-6',
                },
                {
                  id: 'medium',
                  label: 'متوسط ومكبر (36px - الافتراضي الأنيق)',
                  desc: 'حجم واضح ومريح للعين يبرز تفاصيل الشعار',
                  iconSize: 'w-9 h-9',
                },
                {
                  id: 'large',
                  label: 'كبير وبارز (48px - فخامة استثنائية)',
                  desc: 'حجم كبير وبارز جداً للماركات الفارهة',
                  iconSize: 'w-12 h-12',
                },
              ].map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() =>
                    setLocalSettings({ ...localSettings, logo_size: sz.id as BrandLogoSize })
                  }
                  className={`p-3.5 rounded-[16px] border text-right transition-all flex items-center gap-3 ${
                    localSettings.logo_size === sz.id
                      ? 'bg-[#FBF8F3] border-[#C6A36A] ring-1 ring-[#C6A36A]'
                      : 'bg-white border-[#E5D8C9] hover:bg-[#FAF6F0]'
                  }`}
                >
                  <div
                    className={`${sz.iconSize} rounded-[10px] bg-[#2F2B28] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-[#C6A36A]/50`}
                  >
                    B
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2F2B28] block">{sz.label}</span>
                    <span className="text-[10px] text-[#7C736D]">{sz.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles and Text Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Toggle: Show Filter Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC]">
              <div>
                <span className="font-bold text-xs text-[#2F2B28] block">شريط فلاتر البراندات</span>
                <span className="text-[10px] text-[#7C736D]">إظهار شريط البراندات في المعرض</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.show_filter_bar}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, show_filter_bar: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#C6A36A] focus:ring-[#C6A36A] cursor-pointer"
              />
            </div>

            {/* Toggle: Show Product Count */}
            <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC]">
              <div>
                <span className="font-bold text-xs text-[#2F2B28] block">عداد المنتجات بالبراند</span>
                <span className="text-[10px] text-[#7C736D]">عرض عدد القطع المتوفرة بجانب كل براند</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.show_product_count}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, show_product_count: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#C6A36A] focus:ring-[#C6A36A] cursor-pointer"
              />
            </div>

            {/* Toggle: Show on Product Card */}
            <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC]">
              <div>
                <span className="font-bold text-xs text-[#2F2B28] block">شارة البراند ببطاقة المنتج</span>
                <span className="text-[10px] text-[#7C736D]">إظهار اسم/شعار البراند ببطاقة المعرض</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.show_on_product_card}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, show_on_product_card: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#C6A36A] focus:ring-[#C6A36A] cursor-pointer"
              />
            </div>

            {/* Toggle: Show in Product Modal */}
            <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC]">
              <div>
                <span className="font-bold text-xs text-[#2F2B28] block">زر البراند بنافذة التفاصيل</span>
                <span className="text-[10px] text-[#7C736D]">عرض تفاصيل الماركة بالنافذة المنبثقة</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.show_in_product_modal}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, show_in_product_modal: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#C6A36A] focus:ring-[#C6A36A] cursor-pointer"
              />
            </div>

            {/* Filter Title Customization */}
            <div className="sm:col-span-2 p-3.5 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC]">
              <label className="block font-bold text-xs text-[#2F2B28] mb-1">
                عنوان شريط فلاتر العلامات التجارية بالمعرض:
              </label>
              <input
                type="text"
                value={localSettings.filter_title_ar || ''}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, filter_title_ar: e.target.value })
                }
                placeholder="تصفية بحسب العلامة التجارية (البراند):"
                className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[10px] text-xs"
              />
            </div>
          </div>

          {/* Interactive Live Preview Box */}
          <div className="p-4 sm:p-5 rounded-[22px] bg-[#F7F1E8]/70 border border-[#E7D4BC]">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C6A36A]" />
                <span className="text-xs font-bold text-[#6F584A]">
                  المعاينة الحية التفاعلية الفورية (Live Preview):
                </span>
              </div>
              <span className="text-[11px] text-[#8A7465]">
                النمط المختار:{' '}
                <strong className="text-[#2F2B28]">
                  {localSettings.display_mode === 'both'
                    ? 'شعار واسم معاً'
                    : localSettings.display_mode === 'logo_only'
                    ? 'الشعار فقط'
                    : 'الاسم فقط'}
                </strong>{' '}
                | الحجم:{' '}
                <strong className="text-[#2F2B28]">
                  {localSettings.logo_size === 'large'
                    ? 'كبير وبارز'
                    : localSettings.logo_size === 'small'
                    ? 'صغير مدمج'
                    : 'متوسط ومكبر'}
                </strong>
              </span>
            </div>

            {/* Live Filter Bar Sample */}
            <div className="p-4 bg-white rounded-[18px] border border-[#E5D8C9] shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#6F584A]">
                <Award className="w-4 h-4 text-[#C6A36A]" />
                <span>{localSettings.filter_title_ar || 'تصفية بحسب العلامة التجارية (البراند):'}</span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {/* All button */}
                <button
                  type="button"
                  onClick={() => setPreviewSelectedBrandId(null)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[14px] text-xs font-bold transition-all shrink-0 border ${
                    previewSelectedBrandId === null
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-xs'
                      : 'bg-white text-[#5F5751] hover:bg-[#F4ECE2] border-[#E5D8C9]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#C6A36A]"></span>
                  <span>كافة البراندات</span>
                </button>

                {/* Brands in preview */}
                {brands.slice(0, 5).map((brand) => {
                  const isSelected = previewSelectedBrandId === brand.id;
                  const count = products.filter((p) => p.brand_id === brand.id).length;

                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setPreviewSelectedBrandId(brand.id)}
                      className={`group flex items-center gap-2.5 transition-all shrink-0 border ${
                        localSettings.display_mode === 'logo_only'
                          ? 'p-2 rounded-[16px]'
                          : 'px-3.5 py-2 rounded-[14px]'
                      } ${
                        isSelected
                          ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-sm ring-2 ring-[#C6A36A]/40'
                          : 'bg-white text-[#2F2B28] hover:bg-[#F4ECE2] border-[#E5D8C9]'
                      }`}
                    >
                      {/* Logo */}
                      {localSettings.display_mode !== 'name_only' && (
                        <div
                          className={`relative shrink-0 overflow-hidden bg-white rounded-[10px] border flex items-center justify-center ${
                            isSelected ? 'border-[#C6A36A]' : 'border-[#E5D8C9]'
                          } ${
                            localSettings.logo_size === 'large'
                              ? 'w-11 h-11'
                              : localSettings.logo_size === 'small'
                              ? 'w-6 h-6'
                              : 'w-8 h-8 sm:w-9 sm:h-9'
                          }`}
                        >
                          {brand.logo_path && brand.logo_path.trim() !== '' ? (
                            <img
                              src={brand.logo_path}
                              alt={brand.name_ar}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <span className="font-bold text-xs text-[#8A7465]">
                              {brand.name_ar.charAt(0)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Name */}
                      {localSettings.display_mode !== 'logo_only' && (
                        <span className="text-xs font-bold leading-none">{brand.name_ar}</span>
                      )}

                      {/* Count */}
                      {localSettings.show_product_count && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                            isSelected
                              ? 'bg-[#C6A36A] text-[#2F2B28]'
                              : 'bg-[#F4ECE2] text-[#6F584A]'
                          }`}
                        >
                          {count || 4}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Toast feedback inside card */}
            {settingsSavedToast && (
              <div className="mt-3 p-2.5 rounded-[12px] bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>تم حفظ إعدادات العرض وتطبيقها على المتجر بنجاح!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BRANDS DIRECTORY & CRUD TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#C6A36A]" />
              <h3 className="text-base font-bold text-[#6F584A] font-heading">
                قائمة العلامات التجارية المعتمدة بالمتجر ({brands.length})
              </h3>
            </div>
            <p className="text-xs text-[#7C736D]">
              يمكنك هنا إضافة وتعديل وحذف الماركات، وضبط صور وشعارات كل براند وتفعيله.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs transition-colors shrink-0 border border-[#4A3E37]"
            >
              <Plus className="w-4 h-4 text-[#C6A36A]" />
              <span>إضافة براند جديد</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="relative max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن براند بالاسم أو الرمز..."
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#E5D8C9] rounded-[14px] text-xs text-[#2F2B28] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
          />
          <Search className="w-4 h-4 text-[#7C736D] absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Brands Table with Enlarged High-Resolution Logo Previews */}
        <div className="bg-white rounded-[24px] border border-[#E5D8C9] overflow-hidden shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#F4ECE2] text-[#6F584A] font-bold">
              <tr>
                <th className="p-4">شعار وصورة البراند</th>
                <th className="p-4">اسم العلامة التجارية</th>
                <th className="p-4">الاسم بالإنجليزية</th>
                <th className="p-4">الرابط الفرعي (Slug)</th>
                <th className="p-4">المنتجات المرتبطة</th>
                <th className="p-4">الترتيب</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D8C9]">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#7C736D]">
                    لا توجد علامات تجارية مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => {
                  const count = products.filter((p) => p.brand_id === brand.id).length;
                  return (
                    <tr key={brand.id} className="hover:bg-[#FBF8F3] transition-colors">
                      {/* Enlarged Logo Container */}
                      <td className="p-4">
                        <div className="w-14 h-14 rounded-[14px] bg-white border-2 border-[#E7D4BC] p-1 flex items-center justify-center overflow-hidden shadow-2xs">
                          {brand.logo_path && brand.logo_path.trim() !== '' ? (
                            <img
                              src={brand.logo_path}
                              alt={brand.name_ar}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full rounded-[10px] bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center font-bold text-sm">
                              {brand.name_ar.slice(0, 2)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-[#2F2B28] block text-sm mb-0.5">
                          {brand.name_ar}
                        </span>
                        {brand.description_ar && (
                          <span className="text-[11px] text-[#7C736D] line-clamp-1 max-w-xs">
                            {brand.description_ar}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-[#5F5751] font-sans font-medium">
                        {brand.name_en || '-'}
                      </td>

                      <td className="p-4 font-mono text-[11px] text-[#7C736D]">{brand.slug}</td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#F4ECE2] text-[#6F584A] font-bold text-[11px] inline-flex items-center gap-1">
                          <Package className="w-3 h-3 text-[#C6A36A]" />
                          <span>{count} منتجات</span>
                        </span>
                      </td>

                      <td className="p-4 font-mono font-semibold text-[#8A7465]">
                        {brand.sort_order}
                      </td>

                      <td className="p-4">
                        {brand.is_active ? (
                          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                            نشط ومفعل
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                            معطل
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(brand)}
                            className="p-2 rounded-[10px] bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC] transition-colors"
                            title="تعديل البراند"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteBrand(brand)}
                            className="p-2 rounded-[10px] bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            title="حذف البراند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT BRAND */}
      {isModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 text-right border border-[#E5D8C9] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5D8C9] mb-4">
              <h3 className="text-base font-bold text-[#6F584A] font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C6A36A]" />
                <span>
                  {editingBrand.name_ar
                    ? `تعديل براند: ${editingBrand.name_ar}`
                    : 'إضافة علامة تجارية (براند) جديدة'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center hover:bg-[#E7D4BC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">
                  اسم العلامة التجارية بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={editingBrand.name_ar}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name_ar: e.target.value })}
                  placeholder="مثال: شانيل، ديور، رولكس، كارتييه"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">
                  اسم العلامة التجارية بالإنجليزية
                </label>
                <input
                  type="text"
                  value={editingBrand.name_en}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name_en: e.target.value })}
                  placeholder="e.g. CHANEL, DIOR, ROLEX"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">الرابط الفرعي (Slug)</label>
                <input
                  type="text"
                  value={editingBrand.slug}
                  onChange={(e) => setEditingBrand({ ...editingBrand, slug: e.target.value })}
                  placeholder="chanel, dior, rolex"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] font-mono text-[11px]"
                  dir="ltr"
                />
              </div>

              {/* Logo Uploader with enlarged preview */}
              <div>
                <ImageUploader
                  value={editingBrand.logo_path || ''}
                  onChange={(url) => setEditingBrand({ ...editingBrand, logo_path: url })}
                  label="شعار أو صورة البراند (من الجهاز، ألبوم الجوال، أو الكاميرا)"
                  aspectRatioHint="يفضل صورة مربعة عالية الدقة أو شعار بخلفية بيضاء أو شفافة"
                  maxDimension={800}
                  folder="brands"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">
                  نبذة تعريفية عن العلامة التجارية
                </label>
                <textarea
                  rows={2}
                  value={editingBrand.description_ar || ''}
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, description_ar: e.target.value })
                  }
                  placeholder="دار أزياء فاخرة تتميز بالعطور والأناقة والمقتنيات الراقية..."
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">الترتيب في القوائم</label>
                  <input
                    type="number"
                    value={editingBrand.sort_order}
                    onChange={(e) =>
                      setEditingBrand({ ...editingBrand, sort_order: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="brand_is_active"
                    checked={editingBrand.is_active}
                    onChange={(e) =>
                      setEditingBrand({ ...editingBrand, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#C6A36A] focus:ring-[#C6A36A]"
                  />
                  <label htmlFor="brand_is_active" className="font-semibold text-[#2F2B28]">
                    تفعيل البراند في المتجر
                  </label>
                </div>
              </div>

              {/* Storage Setup Notice Banner */}
              {brandStorageNotice && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-[16px] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">{brandStorageNotice}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      تم الاحتفاظ بالشعار في النموذج للمعاينة الحالية، ولكن يلزم إعداد خادم التخزين قبل الحفظ النهائي أو إدخال رابط خارجي.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#E5D8C9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-[12px] bg-[#F4ECE2] text-[#6F584A] font-bold hover:bg-[#E7D4BC]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-[#2F2B28] text-white font-bold hover:bg-[#231F1D]"
                >
                  <Check className="w-4 h-4 text-[#C6A36A]" />
                  <span>حفظ العلامة التجارية</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
