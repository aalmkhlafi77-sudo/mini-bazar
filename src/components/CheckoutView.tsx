import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  Copy,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MiniBazaarLogo } from './MiniBazaarLogo';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    deliveryMethods,
    paymentMethods,
    createOrder,
    setActiveView,
    storeSettings,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [city, setCity] = useState('الرياض');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(deliveryMethods[0]?.id || '');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(paymentMethods[0]?.id || '');
  const [copiedIban, setCopiedIban] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="py-20 px-4 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-[#6F584A] mb-3 font-heading">
          سلة التسوق فارغة
        </h2>
        <p className="text-xs text-[#7C736D] mb-6">
          يرجى إضافة منتجات إلى السلة قبل المتابعة لإتمام الطلب.
        </p>
        <button
          onClick={() => setActiveView('store')}
          className="px-6 py-3 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-semibold shadow-xs"
        >
          العودة للتسوق
        </button>
      </div>
    );
  }

  const selectedDelivery = deliveryMethods.find((d) => d.id === selectedDeliveryId) || deliveryMethods[0];
  const selectedPayment = paymentMethods.find((p) => p.id === selectedPaymentId) || paymentMethods[0];

  // Free shipping check over 450 SAR
  const isFreeDelivery = cartSubtotal >= 450 && selectedDelivery.fee > 0;
  const deliveryFee = isFreeDelivery ? 0 : selectedDelivery.fee;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('يرجى كتابة الاسم الكريم للمستلم');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف واتساب صحيح للتنسيق والتسليم');
      return;
    }

    if (!city.trim() || !district.trim() || !street.trim()) {
      setErrorMessage('يرجى استكمال تفاصيل العنوان (المدينة، الحي، والشارع)');
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrder({
        customerName,
        customerPhone,
        customerEmail,
        address: {
          country: 'المملكة العربية السعودية',
          city,
          district,
          street,
          building,
          notes,
        },
        deliveryMethodId: selectedDeliveryId,
        paymentMethodId: selectedPaymentId,
        customerNotes: notes,
      });
    } catch (err: any) {
      setErrorMessage('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#8A7465] mb-6">
        <button onClick={() => setActiveView('store')} className="hover:text-[#6F584A]">
          المتجر
        </button>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="font-bold text-[#6F584A]">إتمام الطلب المعتمد</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Form Column (7 cols) */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6 text-right">
          {errorMessage && (
            <div className="bg-[#B4574A]/10 border border-[#B4574A]/30 text-[#B4574A] p-4 rounded-[16px] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Customer Personal Information */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs">
            <h3 className="text-base font-bold text-[#6F584A] font-heading mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F4ECE2] text-[#C6A36A] flex items-center justify-center text-xs">
                1
              </span>
              <span>بيانات المستلم والتواصل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  الاسم الكامل <span className="text-[#B4574A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: نورة عبد الله"
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  رقم الواتساب / الجوال <span className="text-[#B4574A]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  البريد الإلكتروني (اختياري لتأكيد الفاتورة)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs">
            <h3 className="text-base font-bold text-[#6F584A] font-heading mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F4ECE2] text-[#C6A36A] flex items-center justify-center text-xs">
                2
              </span>
              <span>عنوان التوصيل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  المدينة <span className="text-[#B4574A]">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                  <option value="الخبر">الخبر</option>
                  <option value="أبها">أبها</option>
                  <option value="تبوك">تبوك</option>
                  <option value="القصيم">القصيم</option>
                  <option value="مدينة أخرى">مدينة أخرى بالمملكة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  الحي <span className="text-[#B4574A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثال: حي النرجس / حي الروضة"
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  اسم الشارع <span className="text-[#B4574A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="مثال: طريق الملك فهد"
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  رقم المبنى / الفيلا
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="مثال: فيلا 22"
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2.5 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5F5751] mb-1.5">
                  ملاحظات الإهداء أو التوصيل
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: أرجو تغليف الحقيبة في علبة هدايا وكتابة إهداء خاص..."
                  className="w-full bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] px-3.5 py-2 text-xs text-[#2F2B28] focus:outline-none focus:border-[#C6A36A]"
                />
              </div>
            </div>
          </div>

          {/* 3. Delivery Method Selection */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs">
            <h3 className="text-base font-bold text-[#6F584A] font-heading mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F4ECE2] text-[#C6A36A] flex items-center justify-center text-xs">
                3
              </span>
              <span>خيار التوصيل والشحن</span>
            </h3>

            <div className="space-y-3">
              {deliveryMethods.map((method) => {
                const isSelected = selectedDeliveryId === method.id;
                const methodFee = isFreeDelivery && method.fee > 0 ? 0 : method.fee;

                return (
                  <label
                    key={method.id}
                    className={`flex items-start justify-between p-4 rounded-[16px] border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#F4ECE2] border-[#C6A36A] ring-1 ring-[#C6A36A]'
                        : 'bg-[#FBF8F3] border-[#E7D4BC] hover:border-[#8A7465]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => setSelectedDeliveryId(method.id)}
                        className="mt-1 accent-[#6F584A]"
                      />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-[#2F2B28] block">
                          {method.name_ar}
                        </span>
                        <span className="text-[11px] text-[#7C736D] mt-0.5 block">
                          {method.description}
                        </span>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      {isFreeDelivery && method.fee > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-[#607866]">مجاناً</span>
                          <span className="text-[10px] text-[#7C736D] line-through">{method.fee} ر.س</span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-[#6F584A]">
                          {methodFee === 0 ? 'مجاناً' : `${methodFee} ر.س`}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Payment Method Selection */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs">
            <h3 className="text-base font-bold text-[#6F584A] font-heading mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F4ECE2] text-[#C6A36A] flex items-center justify-center text-xs">
                4
              </span>
              <span>طريقة الدفع المعتمدة</span>
            </h3>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedPaymentId === method.id;

                return (
                  <div
                    key={method.id}
                    className={`rounded-[16px] border transition-all overflow-hidden ${
                      isSelected
                        ? 'bg-[#F4ECE2]/80 border-[#C6A36A]'
                        : 'bg-[#FBF8F3] border-[#E7D4BC]'
                    }`}
                  >
                    <label className="flex items-center gap-3 p-4 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => setSelectedPaymentId(method.id)}
                        className="accent-[#6F584A]"
                      />
                      <div className="flex-1">
                        <span className="text-xs sm:text-sm font-bold text-[#2F2B28]">
                          {method.name_ar}
                        </span>
                        <p className="text-[11px] text-[#7C736D] mt-0.5">
                          {method.instructions}
                        </p>
                      </div>
                    </label>

                    {/* Bank Details Dropdown if selected */}
                    {isSelected && method.type === 'bank_transfer' && method.bank_details && (
                      <div className="mx-4 mb-4 p-4 rounded-[14px] bg-white border border-[#D9C1A7] text-xs space-y-2">
                        <div className="flex justify-between items-center text-[#5F5751]">
                          <span>البنك المعتمد:</span>
                          <span className="font-bold text-[#2F2B28]">{method.bank_details.bank_name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#5F5751]">
                          <span>اسم الحساب:</span>
                          <span className="font-bold text-[#2F2B28]">{method.bank_details.account_name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#5F5751] pt-1 border-t border-[#F4ECE2]">
                          <span>رقم الآيبان (IBAN):</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#6F584A]" dir="ltr">
                              {method.bank_details.iban}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyIban(method.bank_details!.iban)}
                              className="p-1 rounded bg-[#F4ECE2] text-[#8A7465] hover:text-[#6F584A]"
                              title="نسخ الآيبان"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {copiedIban && (
                          <span className="text-[11px] text-[#607866] block text-center font-bold">
                            تم نسخ رقم الآيبان إلى الحافظة
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 border border-[#4A3E37]"
          >
            {isSubmitting ? (
              <span>جاري تسجيل وتثبيت الطلب...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#C6A36A]" />
                <span>تأكيد الطلب الآن ({grandTotal} ر.س)</span>
              </>
            )}
          </button>
        </form>

        {/* Right/Order Summary Column (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs text-right sticky top-28">
          <h3 className="text-base font-bold text-[#6F584A] font-heading mb-4 pb-3 border-b border-[#F4ECE2]">
            ملخص مقتنيات الطلب ({cart.reduce((a, b) => a + b.quantity, 0)})
          </h3>

          {/* Items Preview */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
            {cart.map((item) => {
              const itemPrice = item.variant?.price ?? item.product.price;
              return (
                <div
                  key={`${item.product.id}-${item.variant?.id || 'd'}`}
                  className="flex items-center gap-3 py-2 border-b border-[#F4ECE2] last:border-none"
                >
                  <img
                    src={item.product.images[0]?.path}
                    alt={item.product.name_ar}
                    className="w-14 h-14 rounded-[10px] object-cover bg-[#F7F1E8] border border-[#E7D4BC] shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#2F2B28] font-heading line-clamp-1">
                      {item.product.name_ar}
                    </h4>
                    {item.variant && (
                      <span className="text-[10px] text-[#8A7465] block">{item.variant.name_ar}</span>
                    )}
                    <span className="text-xs text-[#7C736D]">الكمية: {item.quantity}</span>
                  </div>
                  <span className="text-xs font-bold text-[#6F584A]" dir="ltr">
                    {itemPrice * item.quantity} ر.س
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Calculations */}
          <div className="space-y-2 pt-2 border-t border-[#F4ECE2] text-xs">
            <div className="flex justify-between text-[#7C736D]">
              <span>المجموع الفرعي للمنتجات:</span>
              <span className="font-bold text-[#2F2B28]" dir="ltr">
                {cartSubtotal} ر.س
              </span>
            </div>

            <div className="flex justify-between text-[#7C736D]">
              <span>رسوم التوصيل:</span>
              <span className="font-bold text-[#2F2B28]">
                {deliveryFee === 0 ? (
                  <span className="text-[#607866] font-bold">مجاناً (عرض البوتيك)</span>
                ) : (
                  <span dir="ltr">{deliveryFee} ر.س</span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-[#E5D8C9] text-base font-bold text-[#6F584A]">
              <span>المبلغ الإجمالي المعتمد:</span>
              <span className="text-xl text-[#6F584A]" dir="ltr">
                {grandTotal} <span className="text-xs text-[#8A7465]">ر.س</span>
              </span>
            </div>
          </div>

          {/* Reassurance Guarantee */}
          <div className="mt-6 p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-2 text-[11px] text-[#5F5751]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C6A36A] shrink-0" />
              <span>فحص وتثبيت فوري للأسعار والتوفر على الخادم المركزي.</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C6A36A] shrink-0" />
              <span>تواصل ومتابعة مستمرة عبر واتساب حتى استلام شحنتكِ.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
