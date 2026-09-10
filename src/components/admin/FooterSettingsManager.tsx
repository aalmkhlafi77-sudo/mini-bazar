import React, { useState } from 'react';
import {
  Sliders,
  Palette,
  Type,
  Eye,
  RotateCcw,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Edit2,
  Share2,
  ShieldCheck,
  CreditCard,
  LayoutTemplate,
  ChevronDown,
  Layers,
  ArrowUp,
  ArrowDown,
  Link,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  Paintbrush,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SocialLink, SocialPlatform, NavigationItem } from '../../types';
import { MiniBazaarLogo } from '../MiniBazaarLogo';
import { SocialIcon } from '../SocialIcon';

interface FooterSettingsManagerProps {
  onSuccess?: () => void;
}

type CustomizableElement =
  | 'all'
  | 'header_bg'
  | 'header_announcement'
  | 'header_links'
  | 'header_badges'
  | 'footer_bg'
  | 'footer_headings'
  | 'footer_text'
  | 'footer_links'
  | 'footer_badges'
  | 'navigation_items'
  | 'footer_content';

interface PresetTheme {
  id: string;
  name: string;
  description: string;
  badge: string;
  header_bg: string;
  header_border: string;
  header_announcement_bg: string;
  header_announcement_text: string;
  header_nav_text: string;
  header_nav_active: string;
  header_nav_badge_bg: string;
  header_nav_badge_color: string;
  footer_bg: string;
  footer_border: string;
  footer_text: string;
  footer_heading: string;
  footer_link: string;
  footer_badge_bg: string;
  footer_badge_color: string;
}

const LUXURY_PRESETS: PresetTheme[] = [
  {
    id: 'classic_luxury',
    name: 'داكن فاخر كلاسيكي (هوية ميني بازار الأصيلة)',
    description: 'هيدر عاجي دافئ مع فوتر داكن كلاسيكي وشريط ذهبي ملكي متناسق.',
    badge: 'الافتراضي الموصى به',
    header_bg: '#FBF8F3',
    header_border: '#E5D8C9',
    header_announcement_bg: '#2F2B28',
    header_announcement_text: '#F5E9D8',
    header_nav_text: '#5F5751',
    header_nav_active: '#6F584A',
    header_nav_badge_bg: 'rgba(198, 163, 106, 0.2)',
    header_nav_badge_color: '#8A7465',
    footer_bg: '#2F2B28',
    footer_border: '#4A3E37',
    footer_text: '#C4B7AC',
    footer_heading: '#E7D4BC',
    footer_link: '#E7D4BC',
    footer_badge_bg: '#3D3733',
    footer_badge_color: '#E7D4BC',
  },
  {
    id: 'royal_carbon',
    name: 'أسود كربوني وذهب خالص 24 قيراط',
    description: 'طابع ملكي غامق ومبهر مع لمسات ذهبية حصرية للقطع النفيسة.',
    badge: 'فخامة ملكية',
    header_bg: '#181615',
    header_border: '#332D29',
    header_announcement_bg: '#0F0E0D',
    header_announcement_text: '#D4AF37',
    header_nav_text: '#D5C9BD',
    header_nav_active: '#D4AF37',
    header_nav_badge_bg: '#382F1D',
    header_nav_badge_color: '#E5C158',
    footer_bg: '#141211',
    footer_border: '#2E2924',
    footer_text: '#B3A69A',
    footer_heading: '#F5EBE1',
    footer_link: '#D4AF37',
    footer_badge_bg: '#24201D',
    footer_badge_color: '#E5C158',
  },
  {
    id: 'warm_ivory',
    name: 'بيج عاجي ورخام دافئ متلألئ',
    description: 'ألوان ناصعة ومشرقة بطابع أوروبي فندقي ناعم ونظيف.',
    badge: 'أناقة ناعمة',
    header_bg: '#FFFDF9',
    header_border: '#E8DED1',
    header_announcement_bg: '#4E3E34',
    header_announcement_text: '#FAF5EE',
    header_nav_text: '#4A3F35',
    header_nav_active: '#8C6D58',
    header_nav_badge_bg: '#F0E5D8',
    header_nav_badge_color: '#6F584A',
    footer_bg: '#F5ECE1',
    footer_border: '#E0D2C3',
    footer_text: '#5F5751',
    footer_heading: '#2F2B28',
    footer_link: '#6F584A',
    footer_badge_bg: '#EADECF',
    footer_badge_color: '#3F352E',
  },
  {
    id: 'warm_chocolate',
    name: 'شوكولاتة دافئة وخشب الأبنوس',
    description: 'درجات البني المخملي الدافئ مع ذهب معتق يفيض دفئاً وأصالة.',
    badge: 'طابع مخملي',
    header_bg: '#FAF4EE',
    header_border: '#E6D7CA',
    header_announcement_bg: '#2C1D15',
    header_announcement_text: '#F7EDE3',
    header_nav_text: '#4D382C',
    header_nav_active: '#8E5A3C',
    header_nav_badge_bg: '#F2E2D5',
    header_nav_badge_color: '#8E5A3C',
    footer_bg: '#3A2E26',
    footer_border: '#544338',
    footer_text: '#D5C5B8',
    footer_heading: '#F7EDE3',
    footer_link: '#E6C285',
    footer_badge_bg: '#4C3D33',
    footer_badge_color: '#F7EDE3',
  },
  {
    id: 'midnight_navy',
    name: 'كحلي ليلي وقور وأزرق ملكي',
    description: 'أزرق كحلي عميق مع لمسات من الذهب واللؤلؤ تعكس الهيبة والتميز.',
    badge: 'هيبة وثقة',
    header_bg: '#F8FAFC',
    header_border: '#E2E8F0',
    header_announcement_bg: '#0F172A',
    header_announcement_text: '#E2E8F0',
    header_nav_text: '#334155',
    header_nav_active: '#0F172A',
    header_nav_badge_bg: '#E2E8F0',
    header_nav_badge_color: '#0F172A',
    footer_bg: '#1A222D',
    footer_border: '#2E3B4E',
    footer_text: '#B3BDC7',
    footer_heading: '#F1F5F9',
    footer_link: '#C6A36A',
    footer_badge_bg: '#253141',
    footer_badge_color: '#E2E8F0',
  },
  {
    id: 'emerald_luxury',
    name: 'زمردي ملكي وذهب عتيق',
    description: 'تدرجات الأخضر الزمردي الراقي المستوحى من الحدائق الملكية والذهب.',
    badge: 'نادر وأصيل',
    header_bg: '#F4F7F4',
    header_border: '#D8E2D9',
    header_announcement_bg: '#172B1E',
    header_announcement_text: '#E3EFE5',
    header_nav_text: '#233D2B',
    header_nav_active: '#172B1E',
    header_nav_badge_bg: '#DDE8DF',
    header_nav_badge_color: '#172B1E',
    footer_bg: '#1B2C20',
    footer_border: '#2C4434',
    footer_text: '#C2D4C6',
    footer_heading: '#E7F2E9',
    footer_link: '#E5C158',
    footer_badge_bg: '#263C2D',
    footer_badge_color: '#E7F2E9',
  },
  {
    id: 'dusty_rose',
    name: 'وردي مغبر وبورسلان ناعم',
    description: 'ألوان رقيقة أنثوية فاخرة تناسب العطور والمجوهرات وحقائب المناسبات.',
    badge: 'أنثوي فائق الرقة',
    header_bg: '#FCF8F7',
    header_border: '#EEDDD8',
    header_announcement_bg: '#3B272B',
    header_announcement_text: '#FDEAEB',
    header_nav_text: '#553E42',
    header_nav_active: '#91535E',
    header_nav_badge_bg: '#F9E4E5',
    header_nav_badge_color: '#91535E',
    footer_bg: '#3B2A2D',
    footer_border: '#533C40',
    footer_text: '#E3CBD0',
    footer_heading: '#FDF0F2',
    footer_link: '#F3B4BE',
    footer_badge_bg: '#4E383C',
    footer_badge_color: '#FDF0F2',
  },
];

// Curated luxury swatches for quick color picking
const CURATED_SWATCHES = [
  '#2F2B28',
  '#181615',
  '#3A2E26',
  '#1A222D',
  '#1B2C20',
  '#3B2A2D',
  '#C6A36A',
  '#D4AF37',
  '#E6C285',
  '#FBF8F3',
  '#F5ECE1',
  '#FFFDF9',
  '#FAF4EE',
  '#E5D8C9',
  '#4A3E37',
  '#C4B7AC',
  '#E7D4BC',
  '#FFFFFF',
];

export const FooterSettingsManager: React.FC<FooterSettingsManagerProps> = ({ onSuccess }) => {
  const { storeSettings, updateStoreSettings, categories } = useStore();

  const [selectedElement, setSelectedElement] = useState<CustomizableElement>('all');
  const [saveToast, setSaveToast] = useState(false);

  // Social Links state
  const currentSocialLinks: SocialLink[] = storeSettings.social_links || [
    { id: 's-1', platform: 'instagram', title_ar: 'إنستغرام ميني بازار', url: 'https://instagram.com/minibazaar', is_active: true, sort_order: 1 },
    { id: 's-2', platform: 'tiktok', title_ar: 'تيك توك', url: 'https://tiktok.com/@minibazaar', is_active: true, sort_order: 2 },
    { id: 's-3', platform: 'snapchat', title_ar: 'سناب شات', url: 'https://snapchat.com/add/minibazaar', is_active: true, sort_order: 3 },
    { id: 's-4', platform: 'twitter', title_ar: 'منصة إكس (تويتر)', url: 'https://x.com/minibazaar', is_active: true, sort_order: 4 },
    { id: 's-5', platform: 'whatsapp', title_ar: 'واتساب خدمة العملاء', url: `https://wa.me/${(storeSettings.whatsapp_number || '966500000000').replace(/\D/g, '')}`, is_active: true, sort_order: 5 },
  ];

  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatform>('instagram');
  const [newSocialTitle, setNewSocialTitle] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Commitments state
  const currentCommitments = storeSettings.footer_commitments || [
    { id: 'c-1', text_ar: 'فحص جودة يدوي دقيق لكل قطعة قبل الإرسال.' },
    { id: 'c-2', text_ar: 'بوكس الإهداء الفاخر وشريط الساتان مجاناً.' },
    { id: 'c-3', text_ar: 'دفع آمن مع التحويل البنكي المعتمد.' },
  ];
  const [newCommitmentText, setNewCommitmentText] = useState('');

  // Payment Methods state
  const currentPaymentMethods = storeSettings.footer_payment_methods || [
    'مدى',
    'Apple Pay',
    'Visa',
    'Mastercard',
    'تحويل بنكي',
  ];
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  // Navigation Items state
  const currentNavItems: NavigationItem[] =
    storeSettings.navigation_items && storeSettings.navigation_items.length > 0
      ? storeSettings.navigation_items
      : [
          { id: 'nav-home', title_ar: 'الرئيسية', type: 'home', is_active: true, sort_order: 1 },
          ...categories.map((cat, idx) => ({
            id: `nav-cat-${cat.id}`,
            title_ar: cat.name_ar,
            type: 'category' as const,
            category_id: cat.id,
            is_active: true,
            sort_order: idx + 2,
          })),
          { id: 'nav-offers', title_ar: 'العروض الحصرية', type: 'offers', badge: 'خصومات', is_active: true, sort_order: 99 },
        ];

  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [editingNavItem, setEditingNavItem] = useState<NavigationItem | null>(null);

  // Trigger feedback
  const handleNotify = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    if (onSuccess) onSuccess();
  };

  // Helper for applying full preset
  const handleApplyPresetTheme = (preset: PresetTheme, targetOnly: boolean = false) => {
    if (!targetOnly || selectedElement === 'all') {
      updateStoreSettings({
        header_bg_color: preset.header_bg,
        header_border_color: preset.header_border,
        header_announcement_bg: preset.header_announcement_bg,
        header_announcement_text_color: preset.header_announcement_text,
        header_nav_text_color: preset.header_nav_text,
        header_nav_active_color: preset.header_nav_active,
        header_nav_badge_bg: preset.header_nav_badge_bg,
        header_nav_badge_color: preset.header_nav_badge_color,
        footer_bg_color: preset.footer_bg,
        footer_border_color: preset.footer_border,
        footer_text_color: preset.footer_text,
        footer_heading_color: preset.footer_heading,
        footer_link_color: preset.footer_link,
        footer_badge_bg: preset.footer_badge_bg,
        footer_badge_color: preset.footer_badge_color,
      });
    } else {
      // Apply preset only to the currently chosen element
      switch (selectedElement) {
        case 'header_bg':
          updateStoreSettings({
            header_bg_color: preset.header_bg,
            header_border_color: preset.header_border,
          });
          break;
        case 'header_announcement':
          updateStoreSettings({
            header_announcement_bg: preset.header_announcement_bg,
            header_announcement_text_color: preset.header_announcement_text,
          });
          break;
        case 'header_links':
          updateStoreSettings({
            header_nav_text_color: preset.header_nav_text,
            header_nav_active_color: preset.header_nav_active,
          });
          break;
        case 'header_badges':
          updateStoreSettings({
            header_nav_badge_bg: preset.header_nav_badge_bg,
            header_nav_badge_color: preset.header_nav_badge_color,
          });
          break;
        case 'footer_bg':
          updateStoreSettings({
            footer_bg_color: preset.footer_bg,
            footer_border_color: preset.footer_border,
          });
          break;
        case 'footer_headings':
          updateStoreSettings({
            footer_heading_color: preset.footer_heading,
          });
          break;
        case 'footer_text':
          updateStoreSettings({
            footer_text_color: preset.footer_text,
          });
          break;
        case 'footer_links':
          updateStoreSettings({
            footer_link_color: preset.footer_link,
          });
          break;
        case 'footer_badges':
          updateStoreSettings({
            footer_badge_bg: preset.footer_badge_bg,
            footer_badge_color: preset.footer_badge_color,
          });
          break;
      }
    }
    handleNotify();
  };

  // Reset to default
  const handleResetToDefaults = () => {
    if (confirm('هل ترغبين باستعادة جميع ألوان وتنسيقات الهيدر والفوتر إلى الضبط الكلاسيكي الافتراضي؟')) {
      updateStoreSettings({
        header_bg_color: '#FBF8F3',
        header_border_color: '#E5D8C9',
        header_announcement_bg: '#2F2B28',
        header_announcement_text_color: '#F5E9D8',
        header_nav_font_size: 'sm',
        header_nav_font_weight: 'medium',
        header_nav_text_color: '#5F5751',
        header_nav_active_color: '#6F584A',
        header_nav_badge_bg: 'rgba(198, 163, 106, 0.2)',
        header_nav_badge_color: '#8A7465',
        footer_bg_color: '#2F2B28',
        footer_border_color: '#4A3E37',
        footer_text_color: '#C4B7AC',
        footer_heading_color: '#E7D4BC',
        footer_link_color: '#E7D4BC',
        footer_badge_bg: '#3D3733',
        footer_badge_color: '#E7D4BC',
        footer_font_size: 'xs',
        footer_font_weight: 'normal',
      });
      handleNotify();
    }
  };

  // Current values
  const currentHeaderBg = storeSettings.header_bg_color || '#FBF8F3';
  const currentHeaderBorder = storeSettings.header_border_color || '#E5D8C9';
  const currentAnnouncementBg = storeSettings.header_announcement_bg || '#2F2B28';
  const currentAnnouncementText = storeSettings.header_announcement_text_color || '#F5E9D8';
  const currentNavTextColor = storeSettings.header_nav_text_color || '#5F5751';
  const currentNavActiveColor = storeSettings.header_nav_active_color || '#6F584A';
  const currentNavBadgeBg = storeSettings.header_nav_badge_bg || 'rgba(198, 163, 106, 0.2)';
  const currentNavBadgeColor = storeSettings.header_nav_badge_color || '#8A7465';
  const currentNavFontSize = storeSettings.header_nav_font_size || 'sm';
  const currentNavFontWeight = storeSettings.header_nav_font_weight || 'medium';

  const currentFooterBg = storeSettings.footer_bg_color || '#2F2B28';
  const currentFooterBorder = storeSettings.footer_border_color || '#4A3E37';
  const currentFooterTextColor = storeSettings.footer_text_color || '#C4B7AC';
  const currentFooterHeadingColor = storeSettings.footer_heading_color || '#E7D4BC';
  const currentFooterLinkColor = storeSettings.footer_link_color || '#E7D4BC';
  const currentFooterBadgeBg = storeSettings.footer_badge_bg || '#3D3733';
  const currentFooterBadgeColor = storeSettings.footer_badge_color || '#E7D4BC';
  const currentFooterFontSize = storeSettings.footer_font_size || 'xs';
  const currentFooterFontWeight = storeSettings.footer_font_weight || 'normal';

  // Navigation Items Handlers
  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...currentNavItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    const reordered = newItems.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    updateStoreSettings({ navigation_items: reordered });
    handleNotify();
  };

  const handleDeleteNavItem = (id: string) => {
    if (confirm('هل ترغبين بحذف هذا الرابط من قائمة التنقل؟')) {
      const filtered = currentNavItems.filter((it) => it.id !== id);
      updateStoreSettings({ navigation_items: filtered });
      handleNotify();
    }
  };

  const handleToggleNavItem = (id: string) => {
    const updated = currentNavItems.map((it) =>
      it.id === id ? { ...it, is_active: !it.is_active } : it
    );
    updateStoreSettings({ navigation_items: updated });
    handleNotify();
  };

  const handleSaveNavItemModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNavItem || !editingNavItem.title_ar.trim()) return;

    let updatedList: NavigationItem[];
    const exists = currentNavItems.some((it) => it.id === editingNavItem.id);
    if (exists) {
      updatedList = currentNavItems.map((it) =>
        it.id === editingNavItem.id ? editingNavItem : it
      );
    } else {
      updatedList = [...currentNavItems, editingNavItem];
    }
    updateStoreSettings({ navigation_items: updatedList });
    setIsNavModalOpen(false);
    setEditingNavItem(null);
    handleNotify();
  };

  // Social Links Handlers
  const handleAddSocialLink = () => {
    if (!newSocialUrl.trim()) return;
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: newSocialPlatform,
      title_ar: newSocialTitle.trim() || newSocialPlatform,
      url: newSocialUrl.trim(),
      is_active: true,
      sort_order: currentSocialLinks.length + 1,
    };
    const updated = [...currentSocialLinks, newLink];
    updateStoreSettings({ social_links: updated });
    setNewSocialTitle('');
    setNewSocialUrl('');
    handleNotify();
  };

  const handleDeleteSocialLink = (id: string) => {
    const updated = currentSocialLinks.filter((s) => s.id !== id);
    updateStoreSettings({ social_links: updated });
    handleNotify();
  };

  // Commitments Handlers
  const handleAddCommitment = () => {
    if (!newCommitmentText.trim()) return;
    const updated = [...currentCommitments, { id: `com-${Date.now()}`, text_ar: newCommitmentText.trim() }];
    updateStoreSettings({ footer_commitments: updated });
    setNewCommitmentText('');
    handleNotify();
  };

  const handleDeleteCommitment = (id: string) => {
    if (currentCommitments.length <= 1) {
      alert('يجب الإبقاء على تعهد واحد على الأقل.');
      return;
    }
    const updated = currentCommitments.filter((c) => c.id !== id);
    updateStoreSettings({ footer_commitments: updated });
    handleNotify();
  };

  // Payment Methods Handlers
  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.trim()) return;
    if (currentPaymentMethods.includes(newPaymentMethod.trim())) {
      alert('طريقة الدفع هذه موجودة مسبقاً.');
      return;
    }
    const updated = [...currentPaymentMethods, newPaymentMethod.trim()];
    updateStoreSettings({ footer_payment_methods: updated });
    setNewPaymentMethod('');
    handleNotify();
  };

  const handleDeletePaymentMethod = (method: string) => {
    const updated = currentPaymentMethods.filter((m) => m !== method);
    updateStoreSettings({ footer_payment_methods: updated });
    handleNotify();
  };

  return (
    <div className="bg-white p-5 sm:p-7 rounded-[28px] border border-[#E5D8C9] shadow-sm space-y-8 text-right font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#2F2B28] text-[#F5E9D8] px-4 py-2.5 rounded-xl shadow-2xl border border-[#C6A36A]/50 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#C6A36A]" />
          <span className="text-xs font-bold">تم تطبيق وحفظ التخصيص بنجاح!</span>
        </div>
      )}

      {/* Main Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5D8C9]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center border border-[#E7D4BC] shadow-inner">
            <Sliders className="w-6 h-6 text-[#C6A36A]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2F2B28] font-heading flex items-center gap-2">
              استوديو تخصيص عناصر الهيدر والفوتر الموحد
              <span className="text-[11px] bg-[#C6A36A]/20 text-[#8A7465] px-2.5 py-0.5 rounded-full font-bold border border-[#C6A36A]/30">
                تحكم ذكي متكامل
              </span>
            </h3>
            <p className="text-xs text-[#7C736D] mt-0.5">
              اختاري العنصر المطلوب تحريره من القائمة المنسدلة، وطبّقي عليه القوالب الجاهزة أو التعديل الحر الدقيق مع المعاينة الفورية.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8A7465] hover:text-[#2F2B28] bg-[#FBF8F3] hover:bg-[#F4ECE2] border border-[#E5D8C9] transition-all self-start sm:self-auto"
          title="استعادة الضبط الافتراضي"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C6A36A]" />
          <span>استعادة الضبط الأصلي</span>
        </button>
      </div>

      {/* 1. DROP-DOWN ELEMENT SELECTOR (القائمة المنسدلة لاختيار العنصر المراد تخصيصه) */}
      <div className="bg-gradient-to-l from-[#FAF4EE] to-[#F5ECE1] p-5 rounded-2xl border border-[#E5D8C9] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label htmlFor="element-dropdown-selector" className="text-xs sm:text-sm font-bold text-[#6F584A] flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-[#C6A36A]" />
            <span>اختر من القائمة المنسدلة العنصر الذي ترغب في تحريره:</span>
          </label>
          <span className="text-[11px] text-[#8A7465] bg-white/70 px-2.5 py-1 rounded-lg border border-[#E5D8C9]">
            {selectedElement === 'all'
              ? '🌟 وضع التناسق الكامل الشامل'
              : '🎯 وضع التحرير الدقيق للعنصر المحدد'}
          </span>
        </div>

        <div className="relative">
          <select
            id="element-dropdown-selector"
            value={selectedElement}
            onChange={(e) => setSelectedElement(e.target.value as CustomizableElement)}
            className="w-full bg-white border-2 border-[#C6A36A] focus:border-[#8A7465] text-[#2F2B28] font-bold text-sm rounded-xl p-3 pl-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C6A36A]/20 cursor-pointer transition-all"
          >
            <option value="all">🌟 الباقة الشاملة وتناسق القوالب الجاهزة (الهيدر + الفوتر معاً)</option>
            <optgroup label="─── عناصر وتنسيقات الهيدر العلوي ───">
              <option value="header_bg">🎨 خلفية الهيدر العلوي والحدود الفاصلة</option>
              <option value="header_announcement">📢 شريط الإعلانات الترويجي (الخلفية ولون النص)</option>
              <option value="header_links">🔗 روابط وعناوين القائمة الرئيسية (الألوان والخطوط وحالة النشاط)</option>
              <option value="header_badges">🏷️ شارات الخصومات في القائمة العلوية</option>
              <option value="navigation_items">📋 إدارة عناصر وروابط القائمة الرئيسية (إضافة / تعديل / ترتيب)</option>
            </optgroup>
            <optgroup label="─── عناصر وتنسيقات الفوتر السفلي ───">
              <option value="footer_bg">🏛️ خلفية الفوتر والحدود السفلية</option>
              <option value="footer_headings">📑 عناوين وأقسام الفوتر</option>
              <option value="footer_text">✍️ نصوص وفقرات الفوتر ومعلومات المتجر</option>
              <option value="footer_links">🧭 روابط وأزرار وأفعال الفوتر</option>
              <option value="footer_badges">💳 شارات الدفع والتواصل في الفوتر</option>
              <option value="footer_content">🛡️ إدارة محتوى الفوتر (التعهدات، السوشل ميديا، طرق الدفع، التوثيق)</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* 2. LIVE INTERACTIVE DUAL PREVIEW (معاينة حية تفاعلية مصغرة للهيدر والفوتر) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6F584A]">
            <Eye className="w-4 h-4 text-[#C6A36A]" />
            <span>المعاينة الفورية المباشرة (Live Realtime Studio Preview):</span>
          </div>
          <span className="text-[10px] text-[#25D366] font-bold bg-[#25D366]/10 px-2 py-0.5 rounded-full border border-[#25D366]/30 animate-pulse">
            ● تتحدث تلقائياً مع أي تغيير
          </span>
        </div>

        <div className="border border-[#E5D8C9] rounded-2xl overflow-hidden shadow-inner bg-[#FBF8F3]">
          {/* Header Preview */}
          <div className="border-b border-[#E5D8C9]">
            {/* Announcement bar */}
            <div
              style={{ backgroundColor: currentAnnouncementBg, color: currentAnnouncementText }}
              className="py-1 px-3 text-[10px] flex items-center justify-between font-medium transition-colors"
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#C6A36A]" />
                <span>شحن مجاني للطلبات المميزة ✦ تغليف هدايا ملكي مجاني</span>
              </span>
              <span className="text-[9px] opacity-75">شريط الإعلانات</span>
            </div>

            {/* Header Main Bar */}
            <div
              style={{ backgroundColor: currentHeaderBg, borderColor: currentHeaderBorder }}
              className="p-3 border-b flex items-center justify-between gap-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#2F2B28] font-heading">
                  {storeSettings.store_name_ar || 'ميني بازار'}
                </span>
                <div className="hidden sm:flex items-center gap-2 text-[11px]">
                  <span
                    style={{ color: currentNavActiveColor }}
                    className="font-bold border-b border-[#C6A36A] pb-0.5"
                  >
                    الرئيسية
                  </span>
                  <span style={{ color: currentNavTextColor }}>حقائب فاخرة</span>
                  <span style={{ color: currentNavTextColor }}>ساعات</span>
                  <span
                    style={{ backgroundColor: currentNavBadgeBg, color: currentNavBadgeColor }}
                    className="text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-[#C6A36A]/30"
                  >
                    عروض حصرية
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#7C736D]">
                <span className="bg-black/5 px-2 py-0.5 rounded-lg">المفضلة (2)</span>
                <span className="bg-[#2F2B28] text-white px-2 py-0.5 rounded-lg">السلة (1)</span>
              </div>
            </div>
          </div>

          {/* Dummy body spacer for preview */}
          <div className="py-4 px-6 text-center text-[11px] text-[#A6998E] bg-[#FAF6F0] border-b border-dashed border-[#E5D8C9]">
            ✦ مساحة محتوى المتجر والمنتجات ✦
          </div>

          {/* Footer Preview */}
          <div
            style={{
              backgroundColor: currentFooterBg,
              color: currentFooterTextColor,
              borderColor: currentFooterBorder,
            }}
            className="p-4 border-t space-y-3 transition-colors text-[11px]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b pb-3" style={{ borderColor: currentFooterBorder }}>
              <div>
                <span style={{ color: currentFooterHeadingColor }} className="font-bold block text-xs mb-1">
                  عن المتجر
                </span>
                <p className="text-[10px] leading-relaxed line-clamp-2 opacity-90">
                  {storeSettings.footer_bio_ar || 'ميني بازار — وجهة المقتنيات الفاخرة والأناقة المنتقاة.'}
                </p>
              </div>
              <div>
                <span style={{ color: currentFooterHeadingColor }} className="font-bold block text-xs mb-1">
                  روابط سريعة
                </span>
                <div className="space-y-0.5 text-[10px]" style={{ color: currentFooterLinkColor }}>
                  <span className="block hover:underline cursor-pointer">المتجر والرئيسية</span>
                  <span className="block hover:underline cursor-pointer">السياسات وطرق الدفع</span>
                </div>
              </div>
              <div>
                <span style={{ color: currentFooterHeadingColor }} className="font-bold block text-xs mb-1">
                  تعهدات الجودة
                </span>
                <span className="text-[10px] flex items-center gap-1 opacity-90">
                  <CheckCircle2 className="w-3 h-3 text-[#C6A36A]" />
                  <span>فحص يدوي دقيق لكل طلبية</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]" style={{ borderColor: currentFooterBorder }}>
              <div className="flex items-center gap-1">
                <span style={{ color: currentFooterHeadingColor }} className="opacity-80">طرق الدفع:</span>
                {currentPaymentMethods.slice(0, 3).map((pm, idx) => (
                  <span
                    key={idx}
                    style={{ backgroundColor: currentFooterBadgeBg, color: currentFooterBadgeColor, borderColor: currentFooterBorder }}
                    className="px-1.5 py-0.5 rounded text-[9px] border font-medium"
                  >
                    {pm}
                  </span>
                ))}
              </div>
              <span className="opacity-75">
                © {new Date().getFullYear()} {storeSettings.store_name_ar}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. READY-MADE THEMES & PRESETS (النماذج الجاهزة المتناسقة) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5D8C9]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C6A36A]" />
            <h4 className="text-sm font-bold text-[#2F2B28]">
              النماذج والقوالب الجاهزة (تخصيص جاهز متناسق)
            </h4>
          </div>
          <span className="text-xs text-[#7C736D]">
            انقري على أي قالب لتطبيقه فورياً على الهيدر والفوتر معاً أو على العنصر المختار.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {LUXURY_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-2xl border border-[#E5D8C9] hover:border-[#C6A36A] bg-[#FCFAF7] hover:bg-white transition-all shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="font-bold text-xs text-[#2F2B28]">{preset.name}</h5>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C6A36A]/15 text-[#6F584A] border border-[#C6A36A]/30">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#7C736D] leading-relaxed">
                  {preset.description}
                </p>

                {/* Color Swatch Circles */}
                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-[#8A7465] ml-1">الألوان:</span>
                  <div className="w-4 h-4 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: preset.header_bg }} title="خلفية الهيدر" />
                  <div className="w-4 h-4 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: preset.header_announcement_bg }} title="شريط الإعلانات" />
                  <div className="w-4 h-4 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: preset.footer_bg }} title="خلفية الفوتر" />
                  <div className="w-4 h-4 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: preset.footer_heading }} title="عناوين الفوتر" />
                  <div className="w-4 h-4 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: preset.footer_link }} title="روابط الفوتر" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5D8C9]/60">
                <button
                  type="button"
                  onClick={() => handleApplyPresetTheme(preset, false)}
                  className="w-full py-1.5 px-2 bg-[#2F2B28] hover:bg-[#1A1817] text-white text-[10px] font-bold rounded-xl transition-all shadow-xs text-center"
                >
                  تطبيق شامل (الهيدر + الفوتر)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetTheme(preset, true)}
                  disabled={selectedElement === 'all'}
                  className={`w-full py-1.5 px-2 text-[10px] font-bold rounded-xl border transition-all text-center ${
                    selectedElement === 'all'
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-[#F4ECE2] hover:bg-[#E5D8C9] text-[#6F584A] border-[#E7D4BC]'
                  }`}
                >
                  تطبيق على العنصر المختار فقط
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CONSTRAINED FREE CUSTOMIZATION (التعديل الحر المقيد بمنطق الممكن بحسب العنصر المختار) */}
      <div className="bg-[#FAF6F0] p-5 sm:p-6 rounded-2xl border border-[#E5D8C9] space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5D8C9]">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#C6A36A]" />
            <h4 className="text-sm font-bold text-[#2F2B28]">
              التعديل الحر المقيد بمنطق الممكن ({
                selectedElement === 'all'
                  ? 'التحكم العام في كافة المكونات'
                  : selectedElement === 'header_bg'
                  ? 'خلفية الهيدر والحدود'
                  : selectedElement === 'header_announcement'
                  ? 'شريط الإعلانات'
                  : selectedElement === 'header_links'
                  ? 'روابط وقوائم الهيدر'
                  : selectedElement === 'header_badges'
                  ? 'شارات الهيدر'
                  : selectedElement === 'footer_bg'
                  ? 'خلفية الفوتر والحدود'
                  : selectedElement === 'footer_headings'
                  ? 'عناوين الفوتر'
                  : selectedElement === 'footer_text'
                  ? 'نصوص وفقرات الفوتر'
                  : selectedElement === 'footer_links'
                  ? 'روابط الفوتر'
                  : selectedElement === 'footer_badges'
                  ? 'شارات الفوتر'
                  : selectedElement === 'navigation_items'
                  ? 'إدارة روابط القائمة'
                  : 'محتوى وتعهدات الفوتر'
              })
            </h4>
          </div>
          <span className="text-[11px] text-[#8A7465]">
            تغييرات فورية مع لوحة عينات منتقاة
          </span>
        </div>

        {/* Dynamic Controls based on selected element */}
        {(selectedElement === 'all' || selectedElement === 'header_bg') && (
          <div className="bg-white p-4 rounded-xl border border-[#E5D8C9] space-y-4">
            <h5 className="font-bold text-xs text-[#6F584A] flex items-center gap-2">
              <span>خلفية وحدود الهيدر العلوي</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  لون خلفية الهيدر (Header Background Color):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentHeaderBg}
                    onChange={(e) => {
                      updateStoreSettings({ header_bg_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentHeaderBg}
                    onChange={(e) => {
                      updateStoreSettings({ header_bg_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-32 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9] text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  لون الخط الفاصل السفلي للهيدر (Header Border):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentHeaderBorder}
                    onChange={(e) => {
                      updateStoreSettings({ header_border_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentHeaderBorder}
                    onChange={(e) => {
                      updateStoreSettings({ header_border_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-32 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9] text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Quick Swatches */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-[#8A7465] block mb-1.5">
                عينات سريعة منتقاة لخلفية الهيدر:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {CURATED_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      updateStoreSettings({ header_bg_color: hex });
                      handleNotify();
                    }}
                    style={{ backgroundColor: hex }}
                    className="w-6 h-6 rounded-full border border-black/20 shadow-xs hover:scale-110 transition-transform"
                    title={hex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {(selectedElement === 'all' || selectedElement === 'header_announcement') && (
          <div className="bg-white p-4 rounded-xl border border-[#E5D8C9] space-y-4">
            <h5 className="font-bold text-xs text-[#6F584A] flex items-center gap-2">
              <span>شريط الإعلانات الترويجي العلوي</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  لون خلفية شريط الإعلانات:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentAnnouncementBg}
                    onChange={(e) => {
                      updateStoreSettings({ header_announcement_bg: e.target.value });
                      handleNotify();
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentAnnouncementBg}
                    onChange={(e) => {
                      updateStoreSettings({ header_announcement_bg: e.target.value });
                      handleNotify();
                    }}
                    className="w-32 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9] text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  لون نص وأيقونات شريط الإعلانات:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentAnnouncementText}
                    onChange={(e) => {
                      updateStoreSettings({ header_announcement_text_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentAnnouncementText}
                    onChange={(e) => {
                      updateStoreSettings({ header_announcement_text_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-32 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9] text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {(selectedElement === 'all' || selectedElement === 'header_links' || selectedElement === 'header_badges') && (
          <div className="bg-white p-4 rounded-xl border border-[#E5D8C9] space-y-4">
            <h5 className="font-bold text-xs text-[#6F584A] flex items-center gap-2">
              <span>خطوط وروابط وشارات قائمة الهيدر</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  لون روابط القائمة (عادي):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentNavTextColor}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_text_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentNavTextColor}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_text_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  لون الرابط النشط (Active Link):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentNavActiveColor}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_active_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentNavActiveColor}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_active_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  حجم خط القائمة العلوية:
                </label>
                <select
                  value={currentNavFontSize}
                  onChange={(e) => {
                    updateStoreSettings({ header_nav_font_size: e.target.value as any });
                    handleNotify();
                  }}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5D8C9] bg-white text-[#2F2B28]"
                >
                  <option value="xs">صغير جداً (xs - 12px)</option>
                  <option value="sm">صغير أنيق (sm - 14px - الافتراضي)</option>
                  <option value="base">متوسط (base - 15px)</option>
                  <option value="lg">كبير بارز (lg - 16px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  وزن/سُمك خط القائمة:
                </label>
                <select
                  value={currentNavFontWeight}
                  onChange={(e) => {
                    updateStoreSettings({ header_nav_font_weight: e.target.value as any });
                    handleNotify();
                  }}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5D8C9] bg-white text-[#2F2B28]"
                >
                  <option value="normal">عادي (Normal)</option>
                  <option value="medium">متوسط (Medium - الافتراضي)</option>
                  <option value="semibold">شبه عريض (Semibold)</option>
                  <option value="bold">عريض واضح (Bold)</option>
                </select>
              </div>
            </div>

            {/* Badges Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5D8C9]/60">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  خلفية شارات العروض في الهيدر (Badge Background):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentNavBadgeBg.startsWith('#') ? currentNavBadgeBg : '#F4ECE2'}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_badge_bg: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentNavBadgeBg}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_badge_bg: e.target.value });
                      handleNotify();
                    }}
                    className="w-40 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  لون نص شارات العروض في الهيدر (Badge Text):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={currentNavBadgeColor}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_badge_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentNavBadgeColor}
                    onChange={(e) => {
                      updateStoreSettings({ header_nav_badge_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-32 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {(selectedElement === 'all' || selectedElement === 'footer_bg' || selectedElement === 'footer_headings' || selectedElement === 'footer_text' || selectedElement === 'footer_links' || selectedElement === 'footer_badges') && (
          <div className="bg-white p-4 rounded-xl border border-[#E5D8C9] space-y-4">
            <h5 className="font-bold text-xs text-[#6F584A] flex items-center gap-2">
              <span>خلفية وألوان وخطوط الفوتر السفلي</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  خلفية الفوتر (Footer Background):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFooterBg}
                    onChange={(e) => {
                      updateStoreSettings({ footer_bg_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentFooterBg}
                    onChange={(e) => {
                      updateStoreSettings({ footer_bg_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  عناوين أقسام الفوتر (Headings):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFooterHeadingColor}
                    onChange={(e) => {
                      updateStoreSettings({ footer_heading_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentFooterHeadingColor}
                    onChange={(e) => {
                      updateStoreSettings({ footer_heading_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  نصوص وفقرات الفوتر (Body Text):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFooterTextColor}
                    onChange={(e) => {
                      updateStoreSettings({ footer_text_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentFooterTextColor}
                    onChange={(e) => {
                      updateStoreSettings({ footer_text_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  روابط الفوتر السريعة (Links):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFooterLinkColor}
                    onChange={(e) => {
                      updateStoreSettings({ footer_link_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentFooterLinkColor}
                    onChange={(e) => {
                      updateStoreSettings({ footer_link_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  شارات الدفع والرموز (Badges Bg):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFooterBadgeBg}
                    onChange={(e) => {
                      updateStoreSettings({ footer_badge_bg: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentFooterBadgeBg}
                    onChange={(e) => {
                      updateStoreSettings({ footer_badge_bg: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  الحدود والفواصل في الفوتر (Borders):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentFooterBorder}
                    onChange={(e) => {
                      updateStoreSettings({ footer_border_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5D8C9] p-0.5"
                  />
                  <input
                    type="text"
                    value={currentFooterBorder}
                    onChange={(e) => {
                      updateStoreSettings({ footer_border_color: e.target.value });
                      handleNotify();
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Typography for Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5D8C9]/60">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  حجم خط الفوتر العام:
                </label>
                <select
                  value={currentFooterFontSize}
                  onChange={(e) => {
                    updateStoreSettings({ footer_font_size: e.target.value as any });
                    handleNotify();
                  }}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5D8C9] bg-white text-[#2F2B28]"
                >
                  <option value="xs">صغير أنيق وموجز (xs - 12px - الافتراضي)</option>
                  <option value="sm">متوسط واضح (sm - 14px)</option>
                  <option value="base">كبير مريح (base - 16px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  وزن خط الفوتر:
                </label>
                <select
                  value={currentFooterFontWeight}
                  onChange={(e) => {
                    updateStoreSettings({ footer_font_weight: e.target.value as any });
                    handleNotify();
                  }}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5D8C9] bg-white text-[#2F2B28]"
                >
                  <option value="normal">عادي (Normal - الافتراضي)</option>
                  <option value="medium">متوسط (Medium)</option>
                  <option value="semibold">شبه عريض (Semibold)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 5. NAVIGATION ITEMS MANAGER (إدارة عناصر القائمة الرئيسية) */}
        {(selectedElement === 'all' || selectedElement === 'navigation_items') && (
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E5D8C9] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5D8C9]">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-[#C6A36A]" />
                <h5 className="font-bold text-xs text-[#2F2B28]">
                  إدارة روابط وعناصر القائمة الرئيسية في الهيدر
                </h5>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingNavItem({
                    id: `nav-${Date.now()}`,
                    title_ar: '',
                    type: 'category',
                    category_id: categories[0]?.id || '',
                    badge: '',
                    is_active: true,
                    sort_order: currentNavItems.length + 1,
                  });
                  setIsNavModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6F584A] hover:bg-[#5A4538] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة رابط جديد</span>
              </button>
            </div>

            <div className="space-y-2">
              {currentNavItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    item.is_active !== false
                      ? 'bg-[#FAF6F0] border-[#E5D8C9]'
                      : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-[#E5D8C9] text-[11px] font-bold text-[#6F584A] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2F2B28]">{item.title_ar}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#C6A36A]/20 text-[#6F584A] border border-[#C6A36A]/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8A7465]">
                        {item.type === 'home'
                          ? 'صفحة رئيسية'
                          : item.type === 'offers'
                          ? 'صفحة العروض الحصرية'
                          : item.type === 'category'
                          ? `تصنيف: ${categories.find((c) => c.id === item.category_id)?.name_ar || 'عام'}`
                          : `رابط مخصص: ${item.url || '#'}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveNavItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-[#8A7465] hover:text-[#2F2B28] disabled:opacity-30"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveNavItem(idx, 'down')}
                      disabled={idx === currentNavItems.length - 1}
                      className="p-1.5 text-[#8A7465] hover:text-[#2F2B28] disabled:opacity-30"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleNavItem(item.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold ${
                        item.is_active !== false
                          ? 'text-[#25D366] hover:bg-[#25D366]/10'
                          : 'text-gray-400 hover:bg-gray-200'
                      }`}
                      title={item.is_active !== false ? 'مفعل (انقري للتعطيل)' : 'معطل (انقري للتفعيل)'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNavItem({ ...item });
                        setIsNavModalOpen(true);
                      }}
                      className="p-1.5 text-[#6F584A] hover:text-[#2F2B28]"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {item.type !== 'home' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNavItem(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FOOTER CONTENT, SOCIAL & COMMITMENTS (إدارة محتوى الفوتر وتعهداته والسوشل ميديا) */}
        {(selectedElement === 'all' || selectedElement === 'footer_content') && (
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E5D8C9] space-y-6">
            <h5 className="font-bold text-xs text-[#2F2B28] pb-2 border-b border-[#E5D8C9] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C6A36A]" />
              <span>إدارة محتوى الفوتر الترحيبي، التعهدات، شبكات التواصل، وطرق الدفع</span>
            </h5>

            {/* Bio & Copyright texts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5F5751] mb-1">
                  نبذة المتجر الترحيبية في الفوتر:
                </label>
                <textarea
                  rows={2}
                  value={storeSettings.footer_bio_ar || ''}
                  onChange={(e) => {
                    updateStoreSettings({ footer_bio_ar: e.target.value });
                    handleNotify();
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#E5D8C9] focus:border-[#C6A36A] focus:outline-none"
                  placeholder="ميني بازار — وجهة المقتنيات الفاخرة..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5F5751] mb-1">
                  نص التوثيق والمركز السعودي للأعمال:
                </label>
                <input
                  type="text"
                  value={storeSettings.footer_verification_text_ar || ''}
                  onChange={(e) => {
                    updateStoreSettings({ footer_verification_text_ar: e.target.value });
                    handleNotify();
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#E5D8C9] focus:border-[#C6A36A] focus:outline-none"
                  placeholder="متجر موثق في المركز السعودي للأعمال..."
                />
              </div>
            </div>

            {/* Commitments list */}
            <div className="space-y-3 pt-3 border-t border-[#E5D8C9]">
              <label className="block text-xs font-bold text-[#5F5751]">
                تعهدات ميني بازار الملكية في الفوتر:
              </label>
              <div className="space-y-2">
                {currentCommitments.map((com) => (
                  <div key={com.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E5D8C9] text-xs">
                    <span className="flex items-center gap-2 text-[#2F2B28]">
                      <CheckCircle2 className="w-4 h-4 text-[#C6A36A]" />
                      <span>{com.text_ar}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCommitment(com.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newCommitmentText}
                  onChange={(e) => setNewCommitmentText(e.target.value)}
                  placeholder="أضيفي تعهداً ملكياً جديداً..."
                  className="flex-1 p-2 text-xs rounded-xl border border-[#E5D8C9]"
                />
                <button
                  type="button"
                  onClick={handleAddCommitment}
                  className="px-3.5 py-2 bg-[#6F584A] text-white rounded-xl text-xs font-bold"
                >
                  إضافة تعهد
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 pt-3 border-t border-[#E5D8C9]">
              <label className="block text-xs font-bold text-[#5F5751]">
                طرق الدفع المعروضة في شريط الفوتر:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {currentPaymentMethods.map((pm, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4ECE2] text-[#6F584A] text-xs font-bold rounded-lg border border-[#E7D4BC]"
                  >
                    <span>{pm}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePaymentMethod(pm)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  placeholder="طريقة دفع جديدة (مثل: تابي، تمارا...)"
                  className="w-64 p-2 text-xs rounded-xl border border-[#E5D8C9]"
                />
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  className="px-3.5 py-2 bg-[#6F584A] text-white rounded-xl text-xs font-bold"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-3 border-t border-[#E5D8C9]">
              <label className="block text-xs font-bold text-[#5F5751]">
                قنوات وحسابات السوشل ميديا في الفوتر:
              </label>
              <div className="space-y-2">
                {currentSocialLinks.map((soc) => (
                  <div key={soc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E5D8C9] text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2F2B28] text-white flex items-center justify-center">
                        <SocialIcon platform={soc.platform} className="w-3 h-3" />
                      </div>
                      <span className="font-bold text-[#2F2B28]">{soc.title_ar}</span>
                      <span className="text-[10px] text-[#8A7465] font-mono" dir="ltr">{soc.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSocialLink(soc.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                <select
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value as SocialPlatform)}
                  className="p-2 text-xs rounded-xl border border-[#E5D8C9] bg-white"
                >
                  <option value="instagram">إنستغرام</option>
                  <option value="tiktok">تيك توك</option>
                  <option value="snapchat">سناب شات</option>
                  <option value="twitter">إكس (تويتر)</option>
                  <option value="whatsapp">واتساب</option>
                  <option value="telegram">تيليجرام</option>
                  <option value="facebook">فيسبوك</option>
                  <option value="youtube">يوتيوب</option>
                </select>
                <input
                  type="text"
                  value={newSocialTitle}
                  onChange={(e) => setNewSocialTitle(e.target.value)}
                  placeholder="عنوان الحساب (اختياري)"
                  className="p-2 text-xs rounded-xl border border-[#E5D8C9]"
                />
                <input
                  type="text"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="رابط الحساب (https://...)"
                  className="p-2 text-xs rounded-xl border border-[#E5D8C9]"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="px-3 py-2 bg-[#6F584A] text-white rounded-xl text-xs font-bold"
                >
                  إضافة حساب
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Navigation Item Add/Edit */}
      {isNavModalOpen && editingNavItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5D8C9] space-y-4 text-right">
            <h4 className="text-sm font-bold text-[#2F2B28] font-heading border-b pb-3">
              {editingNavItem.id.startsWith('nav-') ? 'تحرير عنصر القائمة' : 'إضافة عنصر جديد'}
            </h4>

            <form onSubmit={handleSaveNavItemModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5F5751] mb-1">عنوان الرابط (بالعربية):</label>
                <input
                  type="text"
                  required
                  value={editingNavItem.title_ar}
                  onChange={(e) => setEditingNavItem({ ...editingNavItem, title_ar: e.target.value })}
                  placeholder="مثال: الحقائب الملكية، العطور..."
                  className="w-full p-2.5 rounded-xl border border-[#E5D8C9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5F5751] mb-1">نوع الرابط ووجهته:</label>
                <select
                  value={editingNavItem.type}
                  onChange={(e) => setEditingNavItem({ ...editingNavItem, type: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-[#E5D8C9] bg-white"
                >
                  <option value="category">ربط بتصنيف من المتجر</option>
                  <option value="offers">صفحة العروض والخصومات</option>
                  <option value="home">الصفحة الرئيسية</option>
                  <option value="custom">رابط مخصص خارجي أو داخلي</option>
                </select>
              </div>

              {editingNavItem.type === 'category' && (
                <div>
                  <label className="block font-bold text-[#5F5751] mb-1">اختاري التصنيف:</label>
                  <select
                    value={editingNavItem.category_id || categories[0]?.id}
                    onChange={(e) => setEditingNavItem({ ...editingNavItem, category_id: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E5D8C9] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_ar}</option>
                    ))}
                  </select>
                </div>
              )}

              {editingNavItem.type === 'custom' && (
                <div>
                  <label className="block font-bold text-[#5F5751] mb-1">الرابط المخصص (URL):</label>
                  <input
                    type="text"
                    value={editingNavItem.url || ''}
                    onChange={(e) => setEditingNavItem({ ...editingNavItem, url: e.target.value })}
                    placeholder="https://... أو #section"
                    className="w-full p-2.5 rounded-xl border border-[#E5D8C9]"
                    dir="ltr"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#5F5751] mb-1">شارة ترويجية بجانب الرابط (اختياري):</label>
                <input
                  type="text"
                  value={editingNavItem.badge || ''}
                  onChange={(e) => setEditingNavItem({ ...editingNavItem, badge: e.target.value })}
                  placeholder="مثال: جديد، حصري، خصم 20%"
                  className="w-full p-2.5 rounded-xl border border-[#E5D8C9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNavModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5D8C9] text-[#7C736D]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F2B28] text-white font-bold"
                >
                  حفظ الرابط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
