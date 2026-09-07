import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Palette, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product, ProductVariant, Category, Brand } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ImageUploader } from '../ImageUploader';

interface ProductModalProps {
  product: Product;
  categories: Category[];
  brands?: Brand[];
  onSave: (product: Product) => void;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  brands: propBrands,
  onSave,
  onClose,
}) => {
  const { brands: contextBrands } = useStore();
  const brands = propBrands || contextBrands || [];
  const [formData, setFormData] = useState<Product>({ ...product });
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'variants' | 'images'>('basic');

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      product_id: formData.id,
      name_ar: 'لون أو خيار جديد',
      name_en: 'New Option',
      sku: `${formData.sku}-V${formData.variants.length + 1}`,
      price: formData.price,
      compare_at_price: formData.compare_at_price,
      availability_status: 'available',
      is_default: formData.variants.length === 0,
      sort_order: formData.variants.length + 1,
      attribute_type: 'color',
      color_code: '#C6A36A',
      image_path: formData.images[0]?.path || '',
    };

    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant],
    });
  };

  const handleUpdateVariant = (idx: number, updated: Partial<ProductVariant>) => {
    const newVariants = [...formData.variants];
    newVariants[idx] = { ...newVariants[idx], ...updated };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleDeleteVariant = (idx: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== idx);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar.trim()) {
      alert('يرجى كتابة اسم المنتج بالعربية');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] max-w-3xl w-full p-6 sm:p-8 text-right border border-[#E5D8C9] shadow-2xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5D8C9] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#6F584A] font-heading">
              {formData.name_ar ? `تعديل: ${formData.name_ar}` : 'إضافة منتج جديد للمتجر'}
            </h3>
            <span className="text-xs text-[#7C736D]">
              رمز المنتج: <code className="font-mono text-[#C6A36A] font-bold">{formData.sku}</code>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center hover:bg-[#E7D4BC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 py-3 border-b border-[#E5D8C9] shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('basic')}
            className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-colors ${
              activeSubTab === 'basic'
                ? 'bg-[#2F2B28] text-white shadow-xs'
                : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
            }`}
          >
            البيانات الأساسية والتسعير
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('variants')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-colors ${
              activeSubTab === 'variants'
                ? 'bg-[#2F2B28] text-white shadow-xs'
                : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>السمات والمتغيرات ({formData.variants.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('images')}
            className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-colors ${
              activeSubTab === 'images'
                ? 'bg-[#2F2B28] text-white shadow-xs'
                : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
            }`}
          >
            الصورة الرئيسية
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* TAB 1: BASIC INFO */}
          {activeSubTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">اسم المنتج بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="مثال: حقيبة جلدية فاخرة رملية"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">اسم المنتج بالإنجليزية</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Luxury Structured Handbag"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">القسم / التصنيف *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">
                    العلامة التجارية (البراند)
                  </label>
                  <select
                    value={formData.brand_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, brand_id: e.target.value || undefined })
                    }
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  >
                    <option value="">-- بدون براند محدد --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name_ar} {b.name_en ? `(${b.name_en})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">رمز المنتج (SKU)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] font-mono text-[11px]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">السعر المعتمد (ر.س) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">السعر السابق (للخصم)</label>
                  <input
                    type="number"
                    value={formData.compare_at_price || ''}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: Number(e.target.value) || undefined })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                    dir="ltr"
                    placeholder="اختياري"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">حالة التوفر</label>
                  <select
                    value={formData.availability_status}
                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as any })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  >
                    <option value="available">متوفر للطلب الفوري</option>
                    <option value="out_of_stock">نافد حالياً (طلب مسبق/واتساب)</option>
                    <option value="hidden">مخفي من الواجهة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">الوصف المختصر</label>
                <textarea
                  rows={2}
                  value={formData.short_description_ar}
                  onChange={(e) => setFormData({ ...formData, short_description_ar: e.target.value })}
                  placeholder="لمحة سريعة تظهر على بطاقة المنتج في الكتالوج..."
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">الوصف التفصيلي للمنتج</label>
                <textarea
                  rows={3}
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="المواصفات، الخامات، الأبعاد، وتفاصيل التغليف الملكي..."
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              {/* Product Badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                    className="w-4 h-4 accent-[#6F584A]"
                  />
                  <span>شارة: وصل حديثاً</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_best_seller}
                    onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                    className="w-4 h-4 accent-[#6F584A]"
                  />
                  <span>شارة: الأكثر طلباً</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-[#6F584A]"
                  />
                  <span>مميز في الواجهة الرئيسية</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: VARIANTS & ATTRIBUTES SETTINGS */}
          {activeSubTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-[#FBF8F3] rounded-[16px] border border-[#E7D4BC]">
                <div>
                  <h4 className="font-bold text-[#6F584A]">إعدادات سمات وخيارات المنتج</h4>
                  <p className="text-[11px] text-[#7C736D]">
                    أضيفي ألواناً أو مقاسات محددة. عند اختيار العميل لأي لون أو خيار ستتغير صورة المنتج ويضاف الخيار المحدد إلى السلة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shrink-0 border border-[#4A3E37]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
                  <span>إضافة متغير جديد</span>
                </button>
              </div>

              {formData.variants.length === 0 ? (
                <div className="text-center py-8 bg-[#FBF8F3] rounded-[16px] border border-dashed border-[#D9C1A7] text-[#8A7465]">
                  <Palette className="w-8 h-8 mx-auto mb-2 text-[#C6A36A] opacity-60" />
                  <p className="font-semibold text-xs">لا توجد متغيرات مضافة لهذا المنتج بعد.</p>
                  <p className="text-[11px] text-[#7C736D] mt-1">
                    اضغطي على زر "إضافة متغير جديد" لإضافة ألوان ومقاسات وصور خاصة بكل خيار.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.variants.map((variant, vIdx) => (
                    <div
                      key={variant.id || vIdx}
                      className="p-4 rounded-[18px] bg-white border border-[#E5D8C9] shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#F4ECE2]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#6F584A] text-white text-[10px] font-bold flex items-center justify-center">
                            {vIdx + 1}
                          </span>
                          <span className="font-bold text-[#2F2B28]">{variant.name_ar || 'خيار بدون اسم'}</span>
                          {variant.color_code && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                              style={{ backgroundColor: variant.color_code }}
                            />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(vIdx)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="حذف هذا المتغير"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-[#2F2B28] mb-1">اسم الخيار بالعربية *</label>
                          <input
                            type="text"
                            value={variant.name_ar}
                            onChange={(e) => handleUpdateVariant(vIdx, { name_ar: e.target.value })}
                            placeholder="مثال: أسود ملكي، بيج رملي"
                            className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#2F2B28] mb-1">نوع السمة</label>
                          <select
                            value={variant.attribute_type || 'color'}
                            onChange={(e) => handleUpdateVariant(vIdx, { attribute_type: e.target.value as any })}
                            className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px]"
                          >
                            <option value="color">لون (Color)</option>
                            <option value="size">مقاس (Size)</option>
                            <option value="material">خامة (Material)</option>
                            <option value="style">موديل (Style)</option>
                          </select>
                        </div>

                        {variant.attribute_type === 'color' && (
                          <div>
                            <label className="block font-semibold text-[#2F2B28] mb-1">كود اللون (Hex)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={variant.color_code || '#C6A36A'}
                                onChange={(e) => handleUpdateVariant(vIdx, { color_code: e.target.value })}
                                className="w-8 h-8 rounded-[6px] cursor-pointer border border-[#D9C1A7] p-0.5 shrink-0"
                              />
                              <input
                                type="text"
                                value={variant.color_code || ''}
                                onChange={(e) => handleUpdateVariant(vIdx, { color_code: e.target.value })}
                                placeholder="#C6A36A"
                                className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] font-mono text-[11px]"
                                dir="ltr"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-[#2F2B28] mb-1">سعر المتغير (ر.س)</label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleUpdateVariant(vIdx, { price: Number(e.target.value) })}
                            className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px]"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#2F2B28] mb-1">رمز المتغير (SKU)</label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => handleUpdateVariant(vIdx, { sku: e.target.value })}
                            className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px] font-mono text-[11px]"
                            dir="ltr"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-[#2F2B28] mb-1">حالة توفر المتغير</label>
                          <select
                            value={variant.availability_status}
                            onChange={(e) => handleUpdateVariant(vIdx, { availability_status: e.target.value as any })}
                            className="w-full p-2 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[8px]"
                          >
                            <option value="available">متوفر</option>
                            <option value="out_of_stock">نافد</option>
                          </select>
                        </div>
                      </div>

                      {/* Variant-specific Image with device upload */}
                      <div className="pt-2 border-t border-[#F4ECE2]">
                        <ImageUploader
                          value={variant.image_path || ''}
                          onChange={(url) => handleUpdateVariant(vIdx, { image_path: url })}
                          label={`صورة خاصة بالخيار: ${variant.name_ar || `المتغير ${vIdx + 1}`}`}
                          aspectRatioHint="تظهر هذه الصورة فور اختيار العميل لهذا اللون أو المقاس"
                          maxDimension={800}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAIN PRODUCT IMAGE */}
          {activeSubTab === 'images' && (
            <div className="space-y-4">
              <ImageUploader
                value={formData.images[0]?.path || ''}
                onChange={(url) => {
                  const newImgs = [...formData.images];
                  if (newImgs[0]) {
                    newImgs[0].path = url;
                  } else {
                    newImgs.push({
                      id: `img-${Date.now()}`,
                      product_id: formData.id,
                      path: url,
                      alt_text_ar: formData.name_ar,
                      alt_text_en: formData.name_en,
                      sort_order: 1,
                      is_primary: true,
                    });
                  }
                  setFormData({ ...formData, images: newImgs });
                }}
                label="رفع الصورة الرئيسية للمنتج من الجهاز مع معالجة الأبعاد تلقائياً"
                aspectRatioHint="يفضل نسبة مربعة 1:1 بجودة عالية"
                maxDimension={1000}
              />
            </div>
          )}

          {/* Bottom Submit Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5D8C9] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#7C736D] hover:text-[#2F2B28]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold rounded-[14px] shadow-sm active:scale-98 transition-all border border-[#4A3E37]"
            >
              <Check className="w-4 h-4 text-[#C6A36A]" />
              <span>حفظ واعتماد بيانات المنتج</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
