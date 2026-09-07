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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Brand } from '../../types';
import { ImageUploader } from '../ImageUploader';

interface BrandManagerProps {
  onSuccess: (message?: string) => void;
}

export const BrandManager: React.FC<BrandManagerProps> = ({ onSuccess }) => {
  const { brands, saveBrand, deleteBrand, products } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const filteredBrands = brands.filter(
    (b) =>
      b.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
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
    setEditingBrand({ ...brand });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.name_ar.trim()) return;

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

  const handleDelete = (brand: Brand) => {
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

  return (
    <div className="space-y-6 text-right">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#C6A36A]" />
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              إدارة العلامات التجارية والبراندات ({brands.length})
            </h3>
          </div>
          <p className="text-xs text-[#7C736D]">
            يمكنك هنا إضافة وتعديل وحذف الماركات العالمية والمحلية، وربطها بالمنتجات وفلاتر المعرض.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs transition-colors shrink-0 border border-[#4A3E37]"
        >
          <Plus className="w-4 h-4 text-[#C6A36A]" />
          <span>إضافة براند جديد</span>
        </button>
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

      {/* Brands Table */}
      <div className="bg-white rounded-[24px] border border-[#E5D8C9] overflow-hidden shadow-2xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#F4ECE2] text-[#6F584A] font-bold">
            <tr>
              <th className="p-4">العلامة التجارية / الشعار</th>
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
                <td colSpan={7} className="p-8 text-center text-[#7C736D]">
                  لا توجد علامات تجارية مطابقة للبحث
                </td>
              </tr>
            ) : (
              filteredBrands.map((brand) => {
                const count = products.filter((p) => p.brand_id === brand.id).length;
                return (
                  <tr key={brand.id} className="hover:bg-[#FBF8F3] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {brand.logo_path ? (
                        <img
                          src={brand.logo_path}
                          alt={brand.name_ar}
                          className="w-11 h-11 rounded-[12px] object-cover bg-[#F7F1E8] border border-[#E7D4BC] shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-[12px] bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center font-bold text-xs border border-[#E7D4BC] shrink-0">
                          {brand.name_ar.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-[#2F2B28] block text-sm">{brand.name_ar}</span>
                        {brand.description_ar && (
                          <span className="text-[11px] text-[#7C736D] line-clamp-1">
                            {brand.description_ar}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[#5F5751] font-sans">{brand.name_en || '-'}</td>
                    <td className="p-4 font-mono text-[11px] text-[#7C736D]">{brand.slug}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#F4ECE2] text-[#6F584A] font-bold text-[11px] inline-flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#C6A36A]" />
                        <span>{count} منتجات</span>
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-[#8A7465]">{brand.sort_order}</td>
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
                          onClick={() => handleDelete(brand)}
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

            <form onSubmit={handleSave} className="space-y-4 text-xs">
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

              {/* Logo Uploader */}
              <div>
                <ImageUploader
                  value={editingBrand.logo_path || ''}
                  onChange={(url) => setEditingBrand({ ...editingBrand, logo_path: url })}
                  label="شعار أو صورة البراند (من الجهاز أو رابط)"
                  aspectRatioHint="يفضل شعار مربع أو خلفية بيضاء نقية"
                  maxDimension={600}
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
                  placeholder="دار أزياء فاخرة تتميز بالعطور والأناقة..."
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
