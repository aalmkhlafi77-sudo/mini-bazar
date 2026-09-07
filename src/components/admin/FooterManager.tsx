import React, { useState } from 'react';
import {
  LayoutTemplate,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  X,
  Sparkles,
  CreditCard,
  List,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FooterColumn, FooterLink, FooterBullet } from '../../types';

const COMMON_PAYMENT_METHODS = [
  'مدى',
  'Apple Pay',
  'Visa',
  'Mastercard',
  'تحويل بنكي',
  'تابي (Tabby)',
  'تمارا (Tamara)',
  'STC Pay',
];

export const FooterManager: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();

  const [formData, setFormData] = useState({
    footer_bio_ar:
      storeSettings.footer_bio_ar ||
      'ميني بازار — وجهة المقتنيات الفاخرة والأناقة المنتقاة. نوفر لكِ تشكيلة راقية من الحقائب، الساعات، الإكسسوارات، والعطور المختارة بعناية فائقة وتغليف هدايا ملكي.',
    footer_verification_text_ar:
      storeSettings.footer_verification_text_ar ||
      'متجر موثق في المركز السعودي للأعمال ومعروف برقم 392019',
    footer_copyright_ar:
      storeSettings.footer_copyright_ar ||
      `جميع الحقوق محفوظة © ${new Date().getFullYear()} لـ ${storeSettings.store_name_ar} — مقتنيات فاخرة.`,
    footer_designer_credit_ar:
      storeSettings.footer_designer_credit_ar || 'تصميم عبدالله المخلافي 2026',
    footer_show_designer_credit:
      storeSettings.footer_show_designer_credit !== false,
  });

  const [paymentMethods, setPaymentMethods] = useState<string[]>(
    storeSettings.footer_payment_methods && storeSettings.footer_payment_methods.length > 0
      ? storeSettings.footer_payment_methods
      : ['مدى', 'Apple Pay', 'Visa', 'تحويل بنكي']
  );

  const [columns, setColumns] = useState<FooterColumn[]>(
    storeSettings.footer_columns && storeSettings.footer_columns.length > 0
      ? storeSettings.footer_columns
      : [
          {
            id: 'col-categories',
            title_ar: 'أقسام المقتنيات',
            type: 'categories',
            is_active: true,
            sort_order: 1,
          },
          {
            id: 'col-services',
            title_ar: 'خدمة العملاء',
            type: 'links',
            links: [
              { id: 'fl-1', title_ar: 'تغليف الهدايا الفاخر' },
              { id: 'fl-2', title_ar: 'الشحن والتوصيل الفوري' },
              { id: 'fl-3', title_ar: 'الضمان والأصالة' },
              { id: 'fl-4', title_ar: 'الأسئلة الشائعة' },
              { id: 'fl-5', title_ar: 'لوحة إدارة المتجر', action_type: 'admin' },
            ],
            is_active: true,
            sort_order: 2,
          },
          {
            id: 'col-commitments',
            title_ar: 'تعهدات ميني بازار',
            type: 'bullets',
            bullets: [
              { id: 'fb-1', text_ar: 'فحص جودة يدوي دقيق لكل قطعة قبل الإرسال.' },
              { id: 'fb-2', text_ar: 'بوكس الإهداء الفاخر وشريط الساتان مجاناً.' },
              { id: 'fb-3', text_ar: 'دفع آمن مع التحويل البنكي المعتمد.' },
            ],
            is_active: true,
            sort_order: 3,
          },
        ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modal for editing links or bullets inside a column
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newBulletText, setNewBulletText] = useState('');

  const handleTogglePayment = (method: string) => {
    let updated: string[];
    if (paymentMethods.includes(method)) {
      updated = paymentMethods.filter((m) => m !== method);
    } else {
      updated = [...paymentMethods, method];
    }
    setPaymentMethods(updated);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      ...formData,
      footer_payment_methods: paymentMethods,
      footer_columns: columns,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveColumnChanges = (col: FooterColumn) => {
    const updated = columns.map((c) => (c.id === col.id ? col : c));
    setColumns(updated);
    updateStoreSettings({ footer_columns: updated });
    setEditingColumn(null);
  };

  const handleAddLinkToColumn = () => {
    if (!editingColumn || !newLinkTitle.trim()) return;
    const newLink: FooterLink = {
      id: `fl-${Date.now()}`,
      title_ar: newLinkTitle.trim(),
      url: newLinkUrl.trim() || undefined,
    };
    const updatedCol: FooterColumn = {
      ...editingColumn,
      links: [...(editingColumn.links || []), newLink],
    };
    setEditingColumn(updatedCol);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLinkFromColumn = (linkId: string) => {
    if (!editingColumn) return;
    const updatedCol: FooterColumn = {
      ...editingColumn,
      links: (editingColumn.links || []).filter((l) => l.id !== linkId),
    };
    setEditingColumn(updatedCol);
  };

  const handleAddBulletToColumn = () => {
    if (!editingColumn || !newBulletText.trim()) return;
    const newBullet: FooterBullet = {
      id: `fb-${Date.now()}`,
      text_ar: newBulletText.trim(),
    };
    const updatedCol: FooterColumn = {
      ...editingColumn,
      bullets: [...(editingColumn.bullets || []), newBullet],
    };
    setEditingColumn(updatedCol);
    setNewBulletText('');
  };

  const handleRemoveBulletFromColumn = (bulletId: string) => {
    if (!editingColumn) return;
    const updatedCol: FooterColumn = {
      ...editingColumn,
      bullets: (editingColumn.bullets || []).filter((b) => b.id !== bulletId),
    };
    setEditingColumn(updatedCol);
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-[#C6A36A]" />
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              إدارة وتخصيص محتوى الفوتر والتذييل
            </h3>
          </div>
          <p className="text-xs text-[#7C736D] mt-1">
            تحكمي بنص النبذة التعريفية، التوثيق، أعمدة الروابط والتعهدات، وسائل الدفع، وحقوق الملكية
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveGeneral} className="space-y-6 text-xs text-right">
        {/* Bio & Verification */}
        <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
          <h4 className="font-bold text-sm text-[#2F2B28]">نصوص النبذة والتوثيق</h4>

          <div>
            <label className="block font-semibold mb-1 text-[#2F2B28]">
              نص النبذة التعريفية بالمتجر (أسفل الشعار في الفوتر)
            </label>
            <textarea
              rows={3}
              value={formData.footer_bio_ar}
              onChange={(e) =>
                setFormData({ ...formData, footer_bio_ar: e.target.value })
              }
              className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#2F2B28]">
              نص التوثيق والترخيص التجاري
            </label>
            <input
              type="text"
              value={formData.footer_verification_text_ar}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  footer_verification_text_ar: e.target.value,
                })
              }
              className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
            />
          </div>
        </div>

        {/* Footer Columns Manager */}
        <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#2F2B28]">
              أعمدة ومحتويات الفوتر الرئيسية (3 أعمدة)
            </h4>
            <span className="text-[11px] text-[#8A7465]">
              يمكنك النقر على "تعديل الروابط" لتخصيص محتويات كل عمود
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div
                key={col.id}
                className="p-3.5 bg-white rounded-[14px] border border-[#E5D8C9] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#2F2B28]">
                    {col.title_ar}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F4ECE2] text-[#6F584A] font-semibold">
                    {col.type === 'categories'
                      ? 'أقسام تلقائية'
                      : col.type === 'bullets'
                      ? 'نقاط وتعهدات'
                      : 'قائمة روابط'}
                  </span>
                </div>

                <div className="text-[11px] text-[#7C736D] min-h-[48px]">
                  {col.type === 'categories' && (
                    <p>تعرض أقسام المتجر الحالية تلقائياً مع تحديثاتها المباشرة.</p>
                  )}
                  {col.type === 'links' && (
                    <p>{(col.links || []).length} روابط مسجلة (خدمة العملاء، السياسات...)</p>
                  )}
                  {col.type === 'bullets' && (
                    <p>{(col.bullets || []).length} تعهدات وضمانات مسجلة.</p>
                  )}
                </div>

                {col.type !== 'categories' && (
                  <button
                    type="button"
                    onClick={() => setEditingColumn(col)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] font-bold text-xs transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل محتويات العمود</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Accepted Payment Methods */}
        <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#C6A36A]" />
            <h4 className="font-bold text-sm text-[#2F2B28]">
              طرق ووسائل الدفع المعروضة في شريط الفوتر
            </h4>
          </div>
          <p className="text-[11px] text-[#7C736D]">
            حددي خيارات الدفع المعتمدة لعرض شاراتها الأنيقة للمتسوقين:
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {COMMON_PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethods.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleTogglePayment(method)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-2xs'
                      : 'bg-white text-[#7C736D] border-[#D9C1A7] hover:border-[#8A7465]'
                  }`}
                >
                  <span>{method}</span>
                  {isSelected && <span className="text-[#C6A36A]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Designer Credit */}
        <div className="p-4 rounded-[18px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
          <h4 className="font-bold text-sm text-[#2F2B28]">
            الشريط السفلي: حقوق الملكية وتوقيع المصمم
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                نص حقوق النشر والملكية (Copyright)
              </label>
              <input
                type="text"
                value={formData.footer_copyright_ar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer_copyright_ar: e.target.value,
                  })
                }
                className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#2F2B28]">
                توقيع وتصميم المطور (Designer Credit)
              </label>
              <input
                type="text"
                value={formData.footer_designer_credit_ar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer_designer_credit_ar: e.target.value,
                  })
                }
                className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="showDesignerToggle"
                checked={formData.footer_show_designer_credit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer_show_designer_credit: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#2F2B28]"
              />
              <label htmlFor="showDesignerToggle" className="font-semibold text-[#2F2B28]">
                إظهار شارة توقيع المصمم الفاخرة "تصميم عبدالله المخلافي 2026" في أسفل الفوتر
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold border border-[#4A3E37] shadow-xs"
          >
            <Save className="w-4 h-4 text-[#C6A36A]" />
            <span>حفظ إعدادات وتخصيصات الفوتر بالكامل</span>
          </button>
        </div>
      </form>

      {/* MODAL: EDIT COLUMN CONTENTS */}
      {editingColumn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 text-right border border-[#E5D8C9] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5D8C9]">
              <h3 className="text-base font-bold text-[#6F584A] font-heading">
                تعديل محتويات عمود: {editingColumn.title_ar}
              </h3>
              <button
                type="button"
                onClick={() => setEditingColumn(null)}
                className="w-8 h-8 rounded-full bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">
                  عنوان رأس العمود
                </label>
                <input
                  type="text"
                  value={editingColumn.title_ar}
                  onChange={(e) =>
                    setEditingColumn({
                      ...editingColumn,
                      title_ar: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              {/* If Column Type is Links */}
              {editingColumn.type === 'links' && (
                <div className="space-y-3 pt-2">
                  <label className="block font-bold text-[#2F2B28]">
                    الروابط الحالية في العمود:
                  </label>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(editingColumn.links || []).map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#FBF8F3] border border-[#E7D4BC]"
                      >
                        <div>
                          <span className="font-semibold text-[#2F2B28]">
                            {link.title_ar}
                          </span>
                          {link.action_type === 'admin' && (
                            <span className="text-[10px] text-[#C6A36A] mr-2">
                              (يفتح لوحة الإدارة)
                            </span>
                          )}
                          {link.url && (
                            <span
                              dir="ltr"
                              className="text-[10px] text-[#8A7465] mr-2 truncate block max-w-xs"
                            >
                              {link.url}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLinkFromColumn(link.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add link form */}
                  <div className="p-3 rounded-[12px] bg-[#F4ECE2]/50 border border-[#E5D8C9] space-y-2">
                    <span className="font-bold text-[#6F584A] block">
                      إضافة رابط جديد لهذا العمود:
                    </span>
                    <input
                      type="text"
                      placeholder="عنوان الرابط (مثال: الشحن والتوصيل)"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px]"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="الرابط المخصص URL (اختياري، مثلاً https://...)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddLinkToColumn}
                      className="px-3 py-1.5 bg-[#2F2B28] text-white rounded-[8px] font-bold"
                    >
                      + إضافة الرابط
                    </button>
                  </div>
                </div>
              )}

              {/* If Column Type is Bullets */}
              {editingColumn.type === 'bullets' && (
                <div className="space-y-3 pt-2">
                  <label className="block font-bold text-[#2F2B28]">
                    النقاط والتعهدات الحالية:
                  </label>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(editingColumn.bullets || []).map((bullet) => (
                      <div
                        key={bullet.id}
                        className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#FBF8F3] border border-[#E7D4BC]"
                      >
                        <span className="text-[#2F2B28]">✔ {bullet.text_ar}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBulletFromColumn(bullet.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add bullet form */}
                  <div className="p-3 rounded-[12px] bg-[#F4ECE2]/50 border border-[#E5D8C9] space-y-2">
                    <span className="font-bold text-[#6F584A] block">
                      إضافة نقطة أو تعهد جديد:
                    </span>
                    <input
                      type="text"
                      placeholder="نص التعهد (مثال: فحص يدوي دقيق لكل قطعة)"
                      value={newBulletText}
                      onChange={(e) => setNewBulletText(e.target.value)}
                      className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddBulletToColumn}
                      className="px-3 py-1.5 bg-[#2F2B28] text-white rounded-[8px] font-bold"
                    >
                      + إضافة النقطة
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5D8C9]">
                <button
                  type="button"
                  onClick={() => setEditingColumn(null)}
                  className="px-4 py-2 text-[#7C736D]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveColumnChanges(editingColumn)}
                  className="px-5 py-2.5 bg-[#2F2B28] text-white font-bold rounded-[12px] hover:bg-[#231F1D]"
                >
                  تأكيد وتحديث العمود
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
