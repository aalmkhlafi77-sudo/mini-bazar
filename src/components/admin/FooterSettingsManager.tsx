import React, { useState } from 'react';
import {
  PanelBottom,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Share2,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Link,
  Award,
  Globe,
  Instagram,
  Twitter,
  Send,
  Youtube,
  Facebook,
  PhoneCall,
  Save,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SocialLink, SocialPlatform } from '../../types';

interface FooterSettingsManagerProps {
  onSuccess?: () => void;
}

export const FooterSettingsManager: React.FC<FooterSettingsManagerProps> = ({ onSuccess }) => {
  const { storeSettings, updateStoreSettings } = useStore();

  // 1. Social Media Management
  const currentSocialLinks = storeSettings.social_links || [
    { id: 's-1', platform: 'instagram', title_ar: 'إنستغرام ميني بازار', url: 'https://instagram.com/minibazaar', is_active: true, sort_order: 1 },
    { id: 's-2', platform: 'tiktok', title_ar: 'تيك توك', url: 'https://tiktok.com/@minibazaar', is_active: true, sort_order: 2 },
    { id: 's-3', platform: 'snapchat', title_ar: 'سناب شات', url: 'https://snapchat.com/add/minibazaar', is_active: true, sort_order: 3 },
    { id: 's-4', platform: 'twitter', title_ar: 'منصة إكس (تويتر)', url: 'https://x.com/minibazaar', is_active: true, sort_order: 4 },
    { id: 's-5', platform: 'whatsapp', title_ar: 'واتساب خدمة العملاء', url: `https://wa.me/${storeSettings.whatsapp_number.replace(/\D/g, '')}`, is_active: true, sort_order: 5 },
  ];

  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatform>('instagram');
  const [newSocialTitle, setNewSocialTitle] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const handleAddSocialLink = () => {
    if (!newSocialUrl.trim()) return;
    const newLink: SocialLink = {
      id: `soc-${Date.now()}`,
      platform: newSocialPlatform,
      title_ar: newSocialTitle.trim() || getPlatformDefaultName(newSocialPlatform),
      url: newSocialUrl.trim(),
      is_active: true,
      sort_order: currentSocialLinks.length + 1,
    };
    const updated = [...currentSocialLinks, newLink];
    updateStoreSettings({ social_links: updated });
    setNewSocialTitle('');
    setNewSocialUrl('');
    if (onSuccess) onSuccess();
  };

  const handleDeleteSocialLink = (id: string) => {
    const updated = currentSocialLinks.filter((s) => s.id !== id);
    updateStoreSettings({ social_links: updated });
    if (onSuccess) onSuccess();
  };

  const handleToggleSocialLink = (id: string) => {
    const updated = currentSocialLinks.map((s) =>
      s.id === id ? { ...s, is_active: !s.is_active } : s
    );
    updateStoreSettings({ social_links: updated });
    if (onSuccess) onSuccess();
  };

  // 2. Commitments Management
  const currentCommitments = storeSettings.footer_commitments || [
    { id: 'c-1', text_ar: 'فحص جودة يدوي دقيق لكل قطعة قبل الإرسال.' },
    { id: 'c-2', text_ar: 'بوكس الإهداء الفاخر وشريط الساتان مجاناً.' },
    { id: 'c-3', text_ar: 'دفع آمن مع التحويل البنكي المعتمد.' },
  ];

  const [newCommitmentText, setNewCommitmentText] = useState('');
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);
  const [editingCommitmentText, setEditingCommitmentText] = useState('');

  const handleAddCommitment = () => {
    if (!newCommitmentText.trim()) return;
    const updated = [...currentCommitments, { id: `com-${Date.now()}`, text_ar: newCommitmentText.trim() }];
    updateStoreSettings({ footer_commitments: updated });
    setNewCommitmentText('');
    if (onSuccess) onSuccess();
  };

  const handleSaveCommitmentEdit = (id: string) => {
    if (!editingCommitmentText.trim()) return;
    const updated = currentCommitments.map((c) =>
      c.id === id ? { ...c, text_ar: editingCommitmentText.trim() } : c
    );
    updateStoreSettings({ footer_commitments: updated });
    setEditingCommitmentId(null);
    setEditingCommitmentText('');
    if (onSuccess) onSuccess();
  };

  const handleDeleteCommitment = (id: string) => {
    if (currentCommitments.length <= 1) {
      alert('يجب الإبقاء على تعهد واحد على الأقل في الفوتر.');
      return;
    }
    const updated = currentCommitments.filter((c) => c.id !== id);
    updateStoreSettings({ footer_commitments: updated });
    if (onSuccess) onSuccess();
  };

  // 3. Payment Methods Management
  const currentPaymentMethods = storeSettings.footer_payment_methods || [
    'مدى',
    'Apple Pay',
    'Visa',
    'Mastercard',
    'تحويل بنكي',
  ];

  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.trim()) return;
    if (currentPaymentMethods.includes(newPaymentMethod.trim())) {
      alert('طريقة الدفع هذه مضافة مسبقاً.');
      return;
    }
    const updated = [...currentPaymentMethods, newPaymentMethod.trim()];
    updateStoreSettings({ footer_payment_methods: updated });
    setNewPaymentMethod('');
    if (onSuccess) onSuccess();
  };

  const handleDeletePaymentMethod = (method: string) => {
    const updated = currentPaymentMethods.filter((m) => m !== method);
    updateStoreSettings({ footer_payment_methods: updated });
    if (onSuccess) onSuccess();
  };

  const getPlatformDefaultName = (p: SocialPlatform) => {
    switch (p) {
      case 'instagram': return 'إنستغرام';
      case 'tiktok': return 'تيك توك';
      case 'snapchat': return 'سناب شات';
      case 'twitter': return 'إكس (تويتر)';
      case 'whatsapp': return 'واتساب';
      case 'telegram': return 'تيليجرام';
      case 'facebook': return 'فيسبوك';
      case 'youtube': return 'يوتيوب';
      default: return 'منصة اجتماعية';
    }
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#E5D8C9]">
        <div className="w-10 h-10 rounded-xl bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center border border-[#E7D4BC]">
          <PanelBottom className="w-5 h-5 text-[#C6A36A]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#6F584A] font-heading">
            تخصيص وإعدادات الفوتر وقنوات التواصل
          </h3>
          <p className="text-xs text-[#7C736D]">
            التحكم الكامل بنبذة المتجر، معلومات التواصل، البريد، العنوان، قنوات السوشل ميديا، طرق الدفع، وتعهدات ميني بازار.
          </p>
        </div>
      </div>

      {/* 1. About / Bio Text */}
      <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
        <h4 className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C6A36A]" />
          <span>نبذة المتجر في الفوتر (About Bio)</span>
        </h4>
        <textarea
          rows={3}
          value={storeSettings.footer_bio_ar || ''}
          onChange={(e) => updateStoreSettings({ footer_bio_ar: e.target.value })}
          placeholder="ميني بازار — وجهة المقتنيات الفاخرة والأناقة المنتقاة. نوفر لكِ تشكيلة راقية من الحقائب، الساعات، الإكسسوارات، والعطور المختارة بعناية فائقة وتغليف هدايا ملكي."
          className="w-full p-3 bg-white border border-[#D9C1A7] rounded-[10px] text-xs leading-relaxed"
        />
        <p className="text-[11px] text-[#7C736D]">
          تظهر هذه الفقرة تحت الشعار في بداية الفوتر لتعريف الزوار بهوية البوتيك ورسالته.
        </p>
      </div>

      {/* 2. Contact Details (Email, Address, Hours, Verification) */}
      <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
        <h4 className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C6A36A]" />
          <span>بيانات التواصل والتوثيق الرسمي</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">البريد الإلكتروني للكونسيرج</label>
            <div className="flex items-center gap-2 bg-white p-2 border border-[#D9C1A7] rounded-[10px]">
              <Mail className="w-4 h-4 text-[#8A7465] shrink-0" />
              <input
                type="email"
                value={storeSettings.support_email || ''}
                onChange={(e) => updateStoreSettings({ support_email: e.target.value })}
                placeholder="concierge@mini-bazaar.com"
                className="w-full bg-transparent outline-none text-xs"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">ساعات عمل خدمة العملاء</label>
            <div className="flex items-center gap-2 bg-white p-2 border border-[#D9C1A7] rounded-[10px]">
              <Clock className="w-4 h-4 text-[#8A7465] shrink-0" />
              <input
                type="text"
                value={storeSettings.service_hours_ar || ''}
                onChange={(e) => updateStoreSettings({ service_hours_ar: e.target.value })}
                placeholder="يومياً من 10 صباحاً إلى 11 مساءً"
                className="w-full bg-transparent outline-none text-xs"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#5F5751] mb-1">العنوان الفعلي للبوتيك</label>
            <div className="flex items-center gap-2 bg-white p-2 border border-[#D9C1A7] rounded-[10px]">
              <MapPin className="w-4 h-4 text-[#8A7465] shrink-0" />
              <input
                type="text"
                value={storeSettings.boutique_address_ar || ''}
                onChange={(e) => updateStoreSettings({ boutique_address_ar: e.target.value })}
                placeholder="طريق التحلية، سنتريا مول، الطابق الأول، الرياض"
                className="w-full bg-transparent outline-none text-xs"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#5F5751] mb-1">نص ورقم التوثيق (معروف / مركز الأعمال السعودي)</label>
            <div className="flex items-center gap-2 bg-white p-2 border border-[#D9C1A7] rounded-[10px]">
              <ShieldCheck className="w-4 h-4 text-[#C6A36A] shrink-0" />
              <input
                type="text"
                value={storeSettings.footer_verification_text_ar || ''}
                onChange={(e) => updateStoreSettings({ footer_verification_text_ar: e.target.value })}
                placeholder="متجر موثق في المركز السعودي للأعمال ومعروف برقم 392019"
                className="w-full bg-transparent outline-none text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Commitments of Mini Bazaar (تعهدات ميني بازار) */}
      <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>تعهدات ميني بازار (Mini Bazaar Commitments)</span>
          </h4>
          <span className="text-[11px] text-[#7C736D]">{currentCommitments.length} بنود</span>
        </div>

        {/* Add Commitment */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCommitmentText}
            onChange={(e) => setNewCommitmentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCommitment()}
            placeholder="إضافة تعهد جديد (مثال: ضمان الاستبدال خلال 7 أيام)"
            className="flex-1 p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs"
          />
          <button
            type="button"
            onClick={handleAddCommitment}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37]"
          >
            <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>إضافة بند</span>
          </button>
        </div>

        {/* Commitments List */}
        <div className="space-y-2">
          {currentCommitments.map((com, idx) => (
            <div
              key={com.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-[10px] bg-white border border-[#E5D8C9] text-xs"
            >
              {editingCommitmentId === com.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCommitmentText}
                    onChange={(e) => setEditingCommitmentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCommitmentEdit(com.id)}
                    autoFocus
                    className="flex-1 p-1.5 bg-[#FBF8F3] border border-[#C6A36A] rounded-[6px] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveCommitmentEdit(com.id)}
                    className="p-1.5 bg-green-600 text-white rounded-[6px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCommitmentId(null)}
                    className="p-1.5 bg-gray-200 text-gray-700 rounded-[6px]"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#F4ECE2] text-[#6F584A] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-[#2F2B28] truncate">{com.text_ar}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommitmentId(com.id);
                        setEditingCommitmentText(com.text_ar);
                      }}
                      className="p-1.5 rounded bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCommitment(com.id)}
                      className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Social Media Accounts & Icons Manager */}
      <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>إدارة أيقونات وحسابات التواصل الاجتماعي (Social Media)</span>
          </h4>
          <span className="text-[11px] text-[#7C736D]">{currentSocialLinks.length} منصات</span>
        </div>

        {/* Add Social Account */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          <div className="sm:col-span-3">
            <select
              value={newSocialPlatform}
              onChange={(e) => {
                const plat = e.target.value as SocialPlatform;
                setNewSocialPlatform(plat);
                if (!newSocialTitle) setNewSocialTitle(getPlatformDefaultName(plat));
              }}
              className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
            >
              <option value="instagram">Instagram (إنستغرام)</option>
              <option value="tiktok">TikTok (تيك توك)</option>
              <option value="snapchat">Snapchat (سناب شات)</option>
              <option value="twitter">X / Twitter (إكس)</option>
              <option value="whatsapp">WhatsApp (واتساب)</option>
              <option value="telegram">Telegram (تيليجرام)</option>
              <option value="facebook">Facebook (فيسبوك)</option>
              <option value="youtube">YouTube (يوتيوب)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              value={newSocialTitle}
              onChange={(e) => setNewSocialTitle(e.target.value)}
              placeholder="اسم الحساب / العنوان"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
            />
          </div>

          <div className="sm:col-span-4">
            <input
              type="url"
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
              placeholder="https://instagram.com/your-account"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
              dir="ltr"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-[10px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37]"
            >
              <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
              <span>إضافة</span>
            </button>
          </div>
        </div>

        {/* Social Accounts List */}
        <div className="space-y-2">
          {currentSocialLinks.map((soc) => (
            <div
              key={soc.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-[10px] bg-white border border-[#E5D8C9] text-xs"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="p-1.5 rounded-[8px] bg-[#F4ECE2] text-[#6F584A]">
                  {soc.platform === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                  {soc.platform === 'tiktok' && <span className="font-bold text-[10px]">TT</span>}
                  {soc.platform === 'snapchat' && <span className="font-bold text-[10px]">SC</span>}
                  {soc.platform === 'twitter' && <Twitter className="w-3.5 h-3.5" />}
                  {soc.platform === 'whatsapp' && <PhoneCall className="w-3.5 h-3.5" />}
                  {soc.platform === 'telegram' && <Send className="w-3.5 h-3.5" />}
                  {soc.platform === 'facebook' && <Facebook className="w-3.5 h-3.5" />}
                  {soc.platform === 'youtube' && <Youtube className="w-3.5 h-3.5" />}
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-[#2F2B28] block">{soc.title_ar}</span>
                  <span className="text-[10px] text-[#7C736D] truncate block" dir="ltr">
                    {soc.url}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleSocialLink(soc.id)}
                  className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold ${
                    soc.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {soc.is_active ? 'نشط' : 'معطل'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSocialLink(soc.id)}
                  className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Payment Methods Manager (طرق الدفع) */}
      <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
        <h4 className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-[#C6A36A]" />
          <span>إدارة طرق الدفع المعروضة في الفوتر (Payment Badges)</span>
        </h4>

        {/* Add Payment Method */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newPaymentMethod}
            onChange={(e) => setNewPaymentMethod(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPaymentMethod()}
            placeholder="إضافة طريقة دفع (مثال: تمارا، تابي، STC Pay)"
            className="flex-1 p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs"
          />
          <button
            type="button"
            onClick={handleAddPaymentMethod}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37]"
          >
            <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>إضافة طريقة</span>
          </button>
        </div>

        {/* Payment Badges List */}
        <div className="flex flex-wrap items-center gap-2">
          {currentPaymentMethods.map((pm, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D9C1A7] rounded-full text-xs font-bold text-[#6F584A] shadow-2xs"
            >
              <span>{pm}</span>
              <button
                type="button"
                onClick={() => handleDeletePaymentMethod(pm)}
                className="text-red-500 hover:text-red-700"
                title="حذف طريقة الدفع"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Copyright and Designer Signature */}
      <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
        <h4 className="font-bold text-xs text-[#2F2B28] flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#C6A36A]" />
          <span>حقوق النشر وتوقيع المصمم</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">نص حقوق النشر</label>
            <input
              type="text"
              value={storeSettings.footer_copyright_ar || ''}
              onChange={(e) => updateStoreSettings({ footer_copyright_ar: e.target.value })}
              placeholder="جميع الحقوق محفوظة لـ ميني بازار 2026"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5F5751] mb-1">توقيع المصمم والمطور</label>
            <input
              type="text"
              value={storeSettings.footer_designer_credit_ar || ''}
              onChange={(e) => updateStoreSettings({ footer_designer_credit_ar: e.target.value })}
              placeholder="تصميم عبدالله المخلافي 2026"
              className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="showDesignerCredit"
              checked={storeSettings.footer_show_designer_credit !== false}
              onChange={(e) => updateStoreSettings({ footer_show_designer_credit: e.target.checked })}
              className="w-4 h-4 accent-[#2F2B28]"
            />
            <label htmlFor="showDesignerCredit" className="font-semibold text-xs text-[#2F2B28] cursor-pointer">
              إظهار شارة توقيع المصمم (تصميم عبدالله المخلافي 2026) في الفوتر
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
