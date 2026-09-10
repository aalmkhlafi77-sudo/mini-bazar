import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Edit3, Check, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AnnouncementSettingsManagerProps {
  onSuccess?: () => void;
}

export const AnnouncementSettingsManager: React.FC<AnnouncementSettingsManagerProps> = ({ onSuccess }) => {
  const { storeSettings, updateStoreSettings } = useStore();

  const defaultPhrases = [
    '✨ شحن مجاني لكافة الطلبات فوق 450 ر.س',
    '🎁 تغليف هدايا ملكي مجاني مع كل طلبية',
    '💎 منتجات أصلية 100% مختارة بعناية فائقة',
    '🚀 خدمة توصيل سريعة وموثوقة لباب منزلك',
    '💬 خدمة عملاء راقية واستشارات ذوقية متواصلة',
  ];

  const phrases = storeSettings.announcement_phrases && storeSettings.announcement_phrases.length > 0
    ? storeSettings.announcement_phrases
    : (storeSettings.announcement_bar_text_ar
        ? [storeSettings.announcement_bar_text_ar, ...defaultPhrases.slice(1)]
        : defaultPhrases);

  const [newPhrase, setNewPhrase] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddPhrase = () => {
    if (!newPhrase.trim()) return;
    const updated = [...phrases, newPhrase.trim()];
    updateStoreSettings({
      announcement_phrases: updated,
      announcement_bar_text_ar: updated[0] || '',
    });
    setNewPhrase('');
    if (onSuccess) onSuccess();
  };

  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    const updated = [...phrases];
    updated[index] = editingText.trim();
    updateStoreSettings({
      announcement_phrases: updated,
      announcement_bar_text_ar: updated[0] || '',
    });
    setEditingIndex(null);
    setEditingText('');
    if (onSuccess) onSuccess();
  };

  const handleDeletePhrase = (index: number) => {
    if (phrases.length <= 1) {
      alert('يجب الإبقاء على عبارة إعلانية واحدة على الأقل في الشريط.');
      return;
    }
    const updated = phrases.filter((_, i) => i !== index);
    updateStoreSettings({
      announcement_phrases: updated,
      announcement_bar_text_ar: updated[0] || '',
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center border border-[#E7D4BC]">
            <Megaphone className="w-5 h-5 text-[#C6A36A]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              تخصيص وإدارة نصوص الشريط الإعلاني العلوي
            </h3>
            <p className="text-xs text-[#7C736D]">
              التحكم في جميع العبارات والفقرات المتحركة في أعلى المتجر وإمكانية إضافة أو تعديل أو حذف أي نص.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-[#FBF8F3] px-3.5 py-2 rounded-[12px] border border-[#D9C1A7] text-xs font-bold text-[#2F2B28]">
            <input
              type="checkbox"
              checked={storeSettings.announcement_bar_visible}
              onChange={(e) => updateStoreSettings({ announcement_bar_visible: e.target.checked })}
              className="w-4 h-4 accent-[#2F2B28] rounded"
            />
            {storeSettings.announcement_bar_visible ? (
              <span className="flex items-center gap-1 text-green-700">
                <Eye className="w-3.5 h-3.5" />
                الشريط مفعّل وظاهر
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#7C736D]">
                <EyeOff className="w-3.5 h-3.5" />
                الشريط مخفي
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Live Preview of the Ticker */}
      <div className="bg-[#2F2B28] text-[#F5E9D8] p-3 rounded-[14px] border border-[#4A3E37] text-xs shadow-inner overflow-hidden">
        <div className="text-[10px] text-[#C6A36A] font-bold mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>معاينة فورية للشريط الإعلاني:</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto py-1 font-medium whitespace-nowrap">
          {phrases.map((phrase, idx) => (
            <React.Fragment key={idx}>
              <span className="text-[#FBF8F3]">{phrase}</span>
              <span className="text-[#C6A36A]">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Add New Phrase */}
      <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC]">
        <label className="block text-xs font-bold text-[#5F5751] mb-2">
          إضافة عبارة / ميزة جديدة للشريط الإعلاني:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPhrase()}
            placeholder="مثال: ✨ عرض خاص: خصم 20% بمناسبة يوم التأسيس"
            className="flex-1 p-2.5 bg-white border border-[#D9C1A7] rounded-[10px] text-xs"
          />
          <button
            type="button"
            onClick={handleAddPhrase}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37] shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>إضافة</span>
          </button>
        </div>
      </div>

      {/* Phrases List with Edit & Delete Controls */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-[#5F5751]">
          قائمة عبارات الشريط الإعلاني ({phrases.length} عبارات نشطة):
        </label>

        {phrases.map((phrase, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 p-3 rounded-[12px] bg-[#FDFBF7] border border-[#E7D4BC] hover:border-[#D4AF37] transition-colors text-xs"
          >
            {editingIndex === index ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                  autoFocus
                  className="flex-1 p-2 bg-white border border-[#C6A36A] rounded-[8px] text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(index)}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-[8px]"
                  title="حفظ"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-[8px]"
                  title="إلغاء"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center font-bold text-[10px] shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-[#2F2B28] truncate">{phrase}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(index);
                      setEditingText(phrase);
                    }}
                    className="p-2 rounded-[8px] bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]"
                    title="تعديل العبارة"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhrase(index)}
                    className="p-2 rounded-[8px] bg-red-50 text-red-700 hover:bg-red-100"
                    title="حذف العبارة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
