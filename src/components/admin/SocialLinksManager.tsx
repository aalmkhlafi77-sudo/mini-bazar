import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  X,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SocialLink, SocialPlatform } from '../../types';
import { SocialIcon } from '../SocialIcon';

const PLATFORMS: { id: SocialPlatform; label_ar: string; defaultPlaceholder: string }[] = [
  { id: 'instagram', label_ar: 'إنستغرام (Instagram)', defaultPlaceholder: 'https://instagram.com/minibazaar' },
  { id: 'tiktok', label_ar: 'تيك توك (TikTok)', defaultPlaceholder: 'https://tiktok.com/@minibazaar' },
  { id: 'snapchat', label_ar: 'سناب شات (Snapchat)', defaultPlaceholder: 'https://snapchat.com/add/minibazaar' },
  { id: 'twitter', label_ar: 'منصة إكس / تويتر (X / Twitter)', defaultPlaceholder: 'https://x.com/minibazaar' },
  { id: 'whatsapp', label_ar: 'واتساب (WhatsApp)', defaultPlaceholder: 'https://wa.me/966500000000' },
  { id: 'telegram', label_ar: 'تيليجرام (Telegram)', defaultPlaceholder: 'https://t.me/minibazaar' },
  { id: 'youtube', label_ar: 'يوتيوب (YouTube)', defaultPlaceholder: 'https://youtube.com/@minibazaar' },
  { id: 'facebook', label_ar: 'فيسبوك (Facebook)', defaultPlaceholder: 'https://facebook.com/minibazaar' },
  { id: 'pinterest', label_ar: 'بينتريست (Pinterest)', defaultPlaceholder: 'https://pinterest.com/minibazaar' },
  { id: 'linkedin', label_ar: 'لينكد إن (LinkedIn)', defaultPlaceholder: 'https://linkedin.com/company/minibazaar' },
  { id: 'custom', label_ar: 'منصة مخصصة أخرى', defaultPlaceholder: 'https://...' },
];

export const SocialLinksManager: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();

  const [socials, setSocials] = useState<SocialLink[]>(
    storeSettings.social_links || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);

  React.useEffect(() => {
    if (storeSettings.social_links) {
      setSocials(storeSettings.social_links);
    }
  }, [storeSettings.social_links]);

  const saveSocials = (updated: SocialLink[]) => {
    setSocials(updated);
    updateStoreSettings({ social_links: updated });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...socials];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reordered = newItems.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    saveSocials(reordered);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنتِ متأكدة من حذف هذه المنصة؟')) {
      const filtered = socials.filter((s) => s.id !== id);
      saveSocials(filtered);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = socials.map((s) =>
      s.id === id ? { ...s, is_active: !s.is_active } : s
    );
    saveSocials(updated);
  };

  const handleOpenAdd = () => {
    setEditingSocial({
      id: `social-${Date.now()}`,
      platform: 'instagram',
      title_ar: 'إنستغرام',
      url: '',
      is_active: true,
      sort_order: socials.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SocialLink) => {
    setEditingSocial({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocial) return;

    const exists = socials.some((s) => s.id === editingSocial.id);
    let updated: SocialLink[];
    if (exists) {
      updated = socials.map((s) => (s.id === editingSocial.id ? editingSocial : s));
    } else {
      updated = [...socials, editingSocial];
    }
    saveSocials(updated);
    setIsModalOpen(false);
    setEditingSocial(null);
  };

  const handleRestoreDefaults = () => {
    if (confirm('هل ترغبين في استعادة روابط السوشل ميديا الافتراضية؟')) {
      const defaults: SocialLink[] = [
        { id: 'soc-instagram', platform: 'instagram', title_ar: 'إنستغرام', url: 'https://instagram.com', is_active: true, sort_order: 1 },
        { id: 'soc-tiktok', platform: 'tiktok', title_ar: 'تيك توك', url: 'https://tiktok.com', is_active: true, sort_order: 2 },
        { id: 'soc-snapchat', platform: 'snapchat', title_ar: 'سناب شات', url: 'https://snapchat.com', is_active: true, sort_order: 3 },
        { id: 'soc-twitter', platform: 'twitter', title_ar: 'منصة إكس', url: 'https://x.com', is_active: true, sort_order: 4 },
        { id: 'soc-whatsapp', platform: 'whatsapp', title_ar: 'واتساب', url: 'https://wa.me/966500000000', is_active: true, sort_order: 5 },
      ];
      saveSocials(defaults);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#C6A36A]" />
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              أيقونات وروابط منصات التواصل الاجتماعي (سوشل ميديا)
            </h3>
          </div>
          <p className="text-xs text-[#7C736D] mt-1">
            أضيفي أو عدلي حسابات المتجر الرسمية (إنستغرام، تيك توك، سناب شات، إكس وغيرها) لتظهر في الفوتر والصفحات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37] shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>إضافة منصة جديدة</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {socials.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#7C736D] bg-[#FBF8F3] rounded-[16px] border border-dashed border-[#D9C1A7]">
            لم تتم إضافة أي حسابات تواصل بعد.
          </div>
        ) : (
          socials.map((social, index) => (
            <div
              key={social.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[16px] border transition-all ${
                social.is_active
                  ? 'bg-[#FBF8F3] border-[#E7D4BC]'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded text-[#8A7465] hover:bg-[#E7D4BC] disabled:opacity-30"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === socials.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded text-[#8A7465] hover:bg-[#E7D4BC] disabled:opacity-30"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#2F2B28] text-[#E7D4BC] border border-[#4A3E37] flex items-center justify-center shrink-0">
                  <SocialIcon platform={social.platform} className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#2F2B28]">
                      {social.title_ar}
                    </span>
                    <span className="text-[10px] text-[#8A7465] uppercase px-1.5 py-0.5 rounded bg-white border border-[#E5D8C9]">
                      {social.platform}
                    </span>
                  </div>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    dir="ltr"
                    className="flex items-center gap-1 text-[11px] text-[#7C736D] hover:text-[#C6A36A] mt-0.5 truncate max-w-[240px] sm:max-w-md"
                  >
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{social.url}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleToggleActive(social.id)}
                  className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-colors ${
                    social.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {social.is_active ? 'نشط' : 'معطل'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(social)}
                  className="p-2 rounded-[8px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A]"
                  title="تعديل"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(social.id)}
                  className="p-2 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-700"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && editingSocial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 text-right border border-[#E5D8C9] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5D8C9]">
              <h3 className="text-base font-bold text-[#6F584A] font-heading">
                {socials.some((s) => s.id === editingSocial.id)
                  ? 'تعديل منصة تواصل'
                  : 'إضافة منصة تواصل جديدة'}
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
                  اختر المنصة الاجتماعية *
                </label>
                <select
                  value={editingSocial.platform}
                  onChange={(e) => {
                    const plat = e.target.value as SocialPlatform;
                    const matched = PLATFORMS.find((p) => p.id === plat);
                    setEditingSocial({
                      ...editingSocial,
                      platform: plat,
                      title_ar: matched ? matched.label_ar.split(' ')[0] : editingSocial.title_ar,
                    });
                  }}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">
                  اسم أو عنوان المنصة بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={editingSocial.title_ar}
                  onChange={(e) =>
                    setEditingSocial({ ...editingSocial, title_ar: e.target.value })
                  }
                  placeholder="مثال: إنستغرام ميني بازار، حساب تيك توك الرسمي..."
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">
                  رابط الحساب (URL) *
                </label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  value={editingSocial.url}
                  onChange={(e) =>
                    setEditingSocial({ ...editingSocial, url: e.target.value })
                  }
                  placeholder={
                    PLATFORMS.find((p) => p.id === editingSocial.platform)
                      ?.defaultPlaceholder || 'https://...'
                  }
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="socActiveToggle"
                  checked={editingSocial.is_active}
                  onChange={(e) =>
                    setEditingSocial({ ...editingSocial, is_active: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <label htmlFor="socActiveToggle" className="font-semibold text-[#2F2B28]">
                  تفعيل وإظهار هذه المنصة في المتجر
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
