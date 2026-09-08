import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Link2,
  Home,
  Layers,
  Tag,
  Palette,
  Type,
  Eye,
  Sliders,
  Paintbrush,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NavigationItem, NavigationItemType } from '../../types';

interface NavigationMenuManagerProps {
  onSuccess?: () => void;
}

export const NavigationMenuManager: React.FC<NavigationMenuManagerProps> = ({ onSuccess }) => {
  const { storeSettings, updateStoreSettings, categories } = useStore();

  const [items, setItems] = useState<NavigationItem[]>(
    storeSettings.navigation_items || []
  );

  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'styling'>('items');

  // Sync state when storeSettings changes
  React.useEffect(() => {
    if (storeSettings.navigation_items) {
      setItems(storeSettings.navigation_items);
    }
  }, [storeSettings.navigation_items]);

  const saveItems = (updated: NavigationItem[]) => {
    setItems(updated);
    updateStoreSettings({ navigation_items: updated });
    if (onSuccess) onSuccess();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate sort_order
    const reordered = newItems.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    saveItems(reordered);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنتِ متأكدة من رغبتك في حذف هذا العنصر من القائمة؟')) {
      const filtered = items.filter((it) => it.id !== id);
      saveItems(filtered);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, is_active: !it.is_active } : it
    );
    saveItems(updated);
  };

  const handleOpenAdd = () => {
    setEditingItem({
      id: `nav-${Date.now()}`,
      title_ar: '',
      type: 'category',
      category_id: categories[0]?.id || '',
      badge: '',
      is_active: true,
      sort_order: items.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const exists = items.some((it) => it.id === editingItem.id);
    let updated: NavigationItem[];
    if (exists) {
      updated = items.map((it) => (it.id === editingItem.id ? editingItem : it));
    } else {
      updated = [...items, editingItem];
    }
    saveItems(updated);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleRestoreDefaults = () => {
    if (confirm('هل ترغبين في استعادة القائمة الرئيسية الأصلية وتنسيقات الهيدر الافتراضية؟')) {
      const defaults: NavigationItem[] = [
        { id: 'nav-home', title_ar: 'الرئيسية', type: 'home', is_active: true, sort_order: 1 },
        { id: 'nav-bags', title_ar: 'الحقائب الفاخرة', type: 'category', category_id: 'cat-bags', is_active: true, sort_order: 2 },
        { id: 'nav-watches', title_ar: 'الساعات الأنيقة', type: 'category', category_id: 'cat-watches', is_active: true, sort_order: 3 },
        { id: 'nav-eyewear', title_ar: 'النظارات الشمسية', type: 'category', category_id: 'cat-eyewear', is_active: true, sort_order: 4 },
        { id: 'nav-perfumes', title_ar: 'العطور الاستثنائية', type: 'category', category_id: 'cat-perfumes', is_active: true, sort_order: 5 },
        { id: 'nav-accessories', title_ar: 'الهدايا والإكسسوارات', type: 'category', category_id: 'cat-accessories', is_active: true, sort_order: 6 },
        { id: 'nav-offers', title_ar: 'العروض الحصرية', type: 'offers', badge: 'خصومات مميزة', is_active: true, sort_order: 7 },
      ];
      saveItems(defaults);
      updateStoreSettings({
        header_bg_color: '#FBF8F3',
        header_nav_font_size: 'sm',
        header_nav_font_weight: 'medium',
        header_nav_text_color: '#5F5751',
        header_nav_active_color: '#6F584A',
        header_nav_badge_bg: 'rgba(198, 163, 106, 0.2)',
        header_nav_badge_color: '#8A7465',
      });
      if (onSuccess) onSuccess();
    }
  };

  const getItemTypeIcon = (type: NavigationItemType) => {
    switch (type) {
      case 'home':
        return <Home className="w-3.5 h-3.5 text-[#8A7465]" />;
      case 'category':
        return <Layers className="w-3.5 h-3.5 text-[#C6A36A]" />;
      case 'offers':
        return <Tag className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Link2 className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getItemTypeLabel = (type: NavigationItemType) => {
    switch (type) {
      case 'home':
        return 'الرئيسية';
      case 'category':
        return 'قسم منتجات';
      case 'offers':
        return 'عروض حصرية';
      default:
        return 'رابط مخصص';
    }
  };

  // Header styling values
  const currentHeaderBg = storeSettings.header_bg_color || '#FBF8F3';
  const currentNavFontSize = storeSettings.header_nav_font_size || 'sm';
  const currentNavFontWeight = storeSettings.header_nav_font_weight || 'medium';
  const currentNavTextColor = storeSettings.header_nav_text_color || '#5F5751';
  const currentNavActiveColor = storeSettings.header_nav_active_color || '#6F584A';
  const currentBadgeBg = storeSettings.header_nav_badge_bg || 'rgba(198, 163, 106, 0.2)';
  const currentBadgeColor = storeSettings.header_nav_badge_color || '#8A7465';

  // Palette presets
  const headerBgPresets = [
    { name: 'رخامي بيج (الافتراضي)', value: '#FBF8F3' },
    { name: 'أبيض ناصع', value: '#FFFFFF' },
    { name: 'عاجي ملكي', value: '#FAF6F0' },
    { name: 'رمادي دافئ', value: '#F4ECE2' },
    { name: 'رملي ناعم', value: '#F5EBE1' },
    { name: 'لؤلؤي بارد', value: '#F8F9FA' },
    { name: 'داكن ملكي', value: '#1F1C1A' },
  ];

  const navTextColorPresets = [
    { name: 'رمادي دافئ داكن', value: '#5F5751' },
    { name: 'بني شوكولاتي', value: '#4A3E37' },
    { name: 'أسود فحمي', value: '#2F2B28' },
    { name: 'بني توب غني', value: '#6F584A' },
    { name: 'ذهبي ميني بازار', value: '#C6A36A' },
    { name: 'أسود حالك', value: '#111111' },
    { name: 'أبيض نقي', value: '#FFFFFF' },
  ];

  const navActiveColorPresets = [
    { name: 'بني توب عميق', value: '#6F584A' },
    { name: 'ذهبي ميني بازار', value: '#C6A36A' },
    { name: 'عسلي ملكي', value: '#AE8951' },
    { name: 'فحمي داكن', value: '#2F2B28' },
    { name: 'عنابي فاخر', value: '#7F1D1D' },
  ];

  const fontSizeLabels: Record<'xs' | 'sm' | 'base' | 'lg', string> = {
    xs: 'صغير (13px)',
    sm: 'متوسط قياسي (14px)',
    base: 'كبير ومريح (15px)',
    lg: 'كبير جداً (16px)',
  };

  const fontWeightLabels: Record<'normal' | 'medium' | 'semibold' | 'bold', string> = {
    normal: 'عادي (400 - Normal)',
    medium: 'متوسط (500 - Medium)',
    semibold: 'شبه عريض (600 - SemiBold)',
    bold: 'عريض بارز (700 - Bold)',
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div>
          <div className="flex items-center gap-2">
            <Menu className="w-4 h-4 text-[#C6A36A]" />
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              تخصيص شريط القوائم العلوية والهيدر (Header Navigation)
            </h3>
          </div>
          <p className="text-xs text-[#7C736D] mt-1">
            إضافة وتعديل روابط القائمة الرئيسية، وتخصيص حجم الخط، وزن النصوص، لون الروابط، ولون خلفية الهيدر
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] text-xs font-semibold transition-colors"
            title="استعادة الإعدادات الأصلية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">استعادة الافتراضي</span>
          </button>

          {activeTab === 'items' ? (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37] shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
              <span>إضافة رابط للقائمة</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5D8C9] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${
            activeTab === 'items'
              ? 'bg-[#2F2B28] text-white'
              : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
          }`}
        >
          <Menu className="w-3.5 h-3.5" />
          <span>عناصر القائمة والروابط ({items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('styling')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${
            activeTab === 'styling'
              ? 'bg-[#2F2B28] text-white'
              : 'bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]'
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5 text-[#C6A36A]" />
          <span>تنسيق الهيدر (الألوان والخطوط والخلفية)</span>
        </button>
      </div>

      {/* LIVE PREVIEW BANNER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#6F584A]">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>معاينة حية ومباشرة لشريط القوائم في المتجر</span>
          </div>
          <span className="text-[11px] font-normal text-[#8A7465]">تحديث لحظي فور التعديل</span>
        </div>

        <div
          style={{ backgroundColor: currentHeaderBg }}
          className="p-4 rounded-[18px] border border-[#E5D8C9] shadow-xs overflow-x-auto flex items-center justify-center transition-colors duration-200"
        >
          <div className="flex items-center gap-5 sm:gap-6 flex-wrap justify-center">
            {items
              .filter((it) => it.is_active !== false)
              .map((it, idx) => {
                const isSelectedMock = idx === 0;
                return (
                  <div
                    key={it.id}
                    style={{
                      color: isSelectedMock
                        ? currentNavActiveColor
                        : it.type === 'offers'
                        ? '#C6A36A'
                        : currentNavTextColor,
                      borderColor: isSelectedMock ? '#C6A36A' : 'transparent',
                    }}
                    className={`flex items-center gap-1.5 pb-1 transition-all ${
                      currentNavFontSize === 'xs'
                        ? 'text-xs'
                        : currentNavFontSize === 'base'
                        ? 'text-[15px]'
                        : currentNavFontSize === 'lg'
                        ? 'text-base'
                        : 'text-sm'
                    } ${
                      currentNavFontWeight === 'normal'
                        ? 'font-normal'
                        : currentNavFontWeight === 'semibold'
                        ? 'font-semibold'
                        : currentNavFontWeight === 'bold'
                        ? 'font-bold'
                        : 'font-medium'
                    } ${isSelectedMock ? 'border-b-2 font-bold' : ''}`}
                  >
                    <span>{it.title_ar}</span>
                    {it.badge && (
                      <span
                        style={{
                          backgroundColor: currentBadgeBg,
                          color: currentBadgeColor,
                        }}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#C6A36A]/40"
                      >
                        {it.badge}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* TAB 1: ITEMS MANAGEMENT */}
      {activeTab === 'items' && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#7C736D] bg-[#FBF8F3] rounded-[16px] border border-dashed border-[#D9C1A7]">
              لم يتم إضافة أي روابط بعد. اضغطي على "استعادة الافتراضي" أو "إضافة رابط".
            </div>
          ) : (
            items.map((item, index) => {
              const linkedCat = categories.find((c) => c.id === item.category_id);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[16px] border transition-all ${
                    item.is_active
                      ? 'bg-[#FBF8F3] border-[#E7D4BC]'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1 rounded text-[#8A7465] hover:bg-[#E7D4BC] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="تحريك لأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 rounded text-[#8A7465] hover:bg-[#E7D4BC] disabled:opacity-30 disabled:hover:bg-transparent"
                        title="تحريك لأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2 rounded-[10px] bg-white border border-[#E5D8C9]">
                      {getItemTypeIcon(item.type)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2F2B28]">
                          {item.title_ar}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#C6A36A]/20 text-[#8A7465] border border-[#C6A36A]/40">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#7C736D] mt-0.5">
                        <span>{getItemTypeLabel(item.type)}</span>
                        {item.type === 'category' && linkedCat && (
                          <span>• مربوط بـ: {linkedCat.name_ar}</span>
                        )}
                        {item.type === 'custom' && item.url && (
                          <span dir="ltr" className="text-[10px] truncate max-w-[180px]">
                            • {item.url}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id)}
                      className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-colors ${
                        item.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {item.is_active ? 'نشط' : 'معطل'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-[8px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A]"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-700"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: STYLING & CUSTOMIZATION (Font size, weight, text color, header bg) */}
      {activeTab === 'styling' && (
        <div className="space-y-6 pt-2">
          {/* 1. Header Background Color */}
          <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#6F584A] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C6A36A]" />
                <span>لون خلفية شريط الهيدر (Header Background Color):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentHeaderBg}
                  onChange={(e) => updateStoreSettings({ header_bg_color: e.target.value })}
                  className="w-7 h-7 rounded-md cursor-pointer border border-[#D9C1A7]"
                  title="اختيار لون مخصص"
                />
                <span className="font-mono text-xs font-bold text-[#2F2B28]" dir="ltr">
                  {currentHeaderBg}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#7C736D]">
              اختاري من النماذج الفاخرة المعتمدة أو حددي لوناً مخصصاً ينسجم مع هوية ميني بازار
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {headerBgPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    updateStoreSettings({ header_bg_color: preset.value });
                    if (onSuccess) onSuccess();
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    currentHeaderBg.toLowerCase() === preset.value.toLowerCase()
                      ? 'border-[#2F2B28] bg-white shadow-xs font-bold text-[#2F2B28]'
                      : 'border-[#D9C1A7] bg-white/70 text-[#5F5751] hover:bg-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.value }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Font Size & Font Weight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Font Size */}
            <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
              <label className="text-xs font-bold text-[#6F584A] flex items-center gap-2">
                <Type className="w-4 h-4 text-[#C6A36A]" />
                <span>حجم خط نصوص القائمة (Font Size):</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(['xs', 'sm', 'base', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      updateStoreSettings({ header_nav_font_size: size });
                      if (onSuccess) onSuccess();
                    }}
                    className={`p-2.5 rounded-[12px] text-xs text-right border transition-all ${
                      currentNavFontSize === size
                        ? 'bg-[#2F2B28] text-white font-bold border-[#4A3E37] shadow-xs'
                        : 'bg-white text-[#5F5751] border-[#E5D8C9] hover:bg-[#F4ECE2]'
                    }`}
                  >
                    <span>{fontSizeLabels[size]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Weight */}
            <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
              <label className="text-xs font-bold text-[#6F584A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C6A36A]" />
                <span>وزن الخط وسماكة النصوص (Font Weight):</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(['normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => {
                      updateStoreSettings({ header_nav_font_weight: weight });
                      if (onSuccess) onSuccess();
                    }}
                    className={`p-2.5 rounded-[12px] text-xs text-right border transition-all ${
                      currentNavFontWeight === weight
                        ? 'bg-[#2F2B28] text-white font-bold border-[#4A3E37] shadow-xs'
                        : 'bg-white text-[#5F5751] border-[#E5D8C9] hover:bg-[#F4ECE2]'
                    }`}
                  >
                    <span>{fontWeightLabels[weight]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Text Color & Active/Hover Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base Link Color */}
            <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#6F584A] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#C6A36A]" />
                  <span>لون نصوص الروابط الافتراضي:</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentNavTextColor}
                    onChange={(e) => updateStoreSettings({ header_nav_text_color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-[#D9C1A7]"
                  />
                  <span className="font-mono text-xs font-bold" dir="ltr">{currentNavTextColor}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {navTextColorPresets.map((pr) => (
                  <button
                    key={pr.value}
                    type="button"
                    onClick={() => {
                      updateStoreSettings({ header_nav_text_color: pr.value });
                      if (onSuccess) onSuccess();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-white border border-[#E5D8C9] hover:border-[#2F2B28]"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: pr.value }}
                    />
                    <span>{pr.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active & Hover Color */}
            <div className="p-5 rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#6F584A] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#C6A36A]" />
                  <span>لون النص عند التحديد والنشط:</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={currentNavActiveColor}
                    onChange={(e) => updateStoreSettings({ header_nav_active_color: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border border-[#D9C1A7]"
                  />
                  <span className="font-mono text-xs font-bold" dir="ltr">{currentNavActiveColor}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {navActiveColorPresets.map((pr) => (
                  <button
                    key={pr.value}
                    type="button"
                    onClick={() => {
                      updateStoreSettings({ header_nav_active_color: pr.value });
                      if (onSuccess) onSuccess();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-white border border-[#E5D8C9] hover:border-[#2F2B28]"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: pr.value }}
                    />
                    <span>{pr.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MENU ITEM */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 text-right border border-[#E5D8C9] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5D8C9]">
              <h3 className="text-base font-bold text-[#6F584A] font-heading">
                {items.some((it) => it.id === editingItem.id)
                  ? 'تعديل عنصر في القائمة'
                  : 'إضافة رابط جديد للقائمة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">
                  مسمى العنصر (بالعربية) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title_ar}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title_ar: e.target.value })
                  }
                  placeholder="مثال: الحقائب الفاخرة، أحدث الواصلين..."
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">نوع الرابط *</label>
                <select
                  value={editingItem.type}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      type: e.target.value as NavigationItemType,
                    })
                  }
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                >
                  <option value="home">صفحة البداية / الرئيسية</option>
                  <option value="category">قسم منتجات من التصنيفات</option>
                  <option value="offers">العروض الحصرية والتخفيضات</option>
                  <option value="custom">رابط مخصص أو خارجي</option>
                </select>
              </div>

              {editingItem.type === 'category' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">
                    اختر القسم المرتبط
                  </label>
                  <select
                    value={editingItem.category_id || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category_id: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingItem.type === 'custom' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">
                    الرابط المخصص (URL أو وسم #)
                  </label>
                  <input
                    type="text"
                    value={editingItem.url || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, url: e.target.value })
                    }
                    placeholder="مثال: https://... أو #products-section"
                    dir="ltr"
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">
                  شارة مميزة (Badge اختياري)
                </label>
                <input
                  type="text"
                  value={editingItem.badge || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, badge: e.target.value })
                  }
                  placeholder="مثال: خصومات مميزة، جديد، حصري"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="navActiveToggle"
                  checked={editingItem.is_active}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, is_active: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <label htmlFor="navActiveToggle" className="font-semibold text-[#2F2B28]">
                  تفعيل وظهور هذا العنصر في القائمة
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5D8C9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#7C736D]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2F2B28] text-white font-bold rounded-[12px] hover:bg-[#231F1D]"
                >
                  حفظ وتثبيت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
