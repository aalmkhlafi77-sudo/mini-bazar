import React from 'react';
import { MiniBazaarLogo } from './MiniBazaarLogo';
import {
  MessageCircle,
  ShieldCheck,
  Sparkles,
  ArrowUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  Store,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SocialIcon } from './SocialIcon';

export const Footer: React.FC = () => {
  const { storeSettings, categories, setSelectedCategory, setActiveView } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeSocials = (storeSettings.social_links || [])
    .filter((s) => s.is_active !== false && s.url)
    .sort((a, b) => a.sort_order - b.sort_order);

  const footerBio =
    storeSettings.footer_bio_ar ||
    'ميني بازار — وجهة المقتنيات الفاخرة والأناقة المنتقاة. نوفر لكِ تشكيلة راقية من الحقائب، الساعات، الإكسسوارات، والعطور المختارة بعناية فائقة وتغليف هدايا ملكي.';

  const verificationText =
    storeSettings.footer_verification_text_ar ||
    'متجر موثق في المركز السعودي للأعمال ومعروف برقم 392019';

  const designerCredit =
    storeSettings.footer_designer_credit_ar || 'تصميم: عبدالله المخلافي 2026';

  const showDesignerCredit = storeSettings.footer_show_designer_credit !== false;

  const commitments =
    storeSettings.footer_commitments && storeSettings.footer_commitments.length > 0
      ? storeSettings.footer_commitments
      : [
          { id: 'c-1', text_ar: 'فحص جودة يدوي دقيق لكل قطعة قبل الإرسال.' },
          { id: 'c-2', text_ar: 'بوكس الإهداء الفاخر وشريط الساتان مجاناً.' },
          { id: 'c-3', text_ar: 'دفع آمن مع التحويل البنكي المعتمد.' },
        ];

  const paymentMethods =
    storeSettings.footer_payment_methods && storeSettings.footer_payment_methods.length > 0
      ? storeSettings.footer_payment_methods
      : ['مدى', 'Apple Pay', 'Visa', 'Mastercard', 'تحويل بنكي'];

  const handleLinkClick = (action: string) => {
    if (action === 'store') {
      setSelectedCategory(null);
      setActiveView('store');
      scrollToTop();
    } else if (action === 'wishlist') {
      setActiveView('wishlist');
      scrollToTop();
    } else if (action === 'admin') {
      setActiveView('admin');
      scrollToTop();
    } else if (action === 'orders') {
      setActiveView('admin');
      scrollToTop();
    }
  };

  return (
    <footer className="bg-[#2F2B28] text-[#E7D4BC] pt-14 pb-28 lg:pb-12 border-t border-[#4A3E37] text-right font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#4A3E37]">
          
          {/* Brand Info & Bio (5 Columns) */}
          <div className="lg:col-span-4 space-y-4">
            <MiniBazaarLogo variant="full" inverted={true} />

            <p className="text-xs sm:text-sm text-[#C4B7AC] leading-relaxed pt-2">
              {footerBio}
            </p>

            {/* Social Media Links Icons */}
            {activeSocials.length > 0 && (
              <div className="pt-2">
                <span className="block text-[11px] text-[#8A7465] mb-2 font-medium">
                  تابعوا منصاتنا الاجتماعية:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {activeSocials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      title={social.title_ar}
                      aria-label={social.title_ar}
                      className="w-8 h-8 rounded-full bg-[#3D3733] hover:bg-[#C6A36A] hover:text-[#2F2B28] text-[#E7D4BC] border border-[#5A4538] flex items-center justify-center transition-all duration-200"
                    >
                      <SocialIcon platform={social.platform} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Business Verification */}
            {verificationText && (
              <div className="flex items-center gap-2 text-[11px] text-[#A6998E] pt-2">
                <ShieldCheck className="w-4 h-4 text-[#C6A36A] shrink-0" />
                <span>{verificationText}</span>
              </div>
            )}
          </div>

          {/* Section 1: تواصلي معنا (Contact Info) - 3 Columns */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-[#F5E9D8] font-heading tracking-wide border-b border-[#4A3E37] pb-2 inline-block">
              تواصلي معنا
            </h3>

            <div className="space-y-3 text-xs text-[#C4B7AC]">
              {/* WhatsApp Link */}
              <a
                href={`https://wa.me/${storeSettings.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#4ADE80] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span className="font-semibold text-xs text-[#F5E9D8]">واتساب خدمة العملاء:</span>
                </div>
                <span dir="ltr" className="font-mono text-xs font-bold text-white">
                  {storeSettings.whatsapp_number}
                </span>
              </a>

              {/* Phone Link */}
              {storeSettings.phone_number && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#3D3733]/60 border border-[#4A3E37]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C6A36A] shrink-0" />
                    <span className="text-[#8A7465]">رقم الاتصال:</span>
                  </div>
                  <a
                    href={`tel:${storeSettings.phone_number}`}
                    dir="ltr"
                    className="hover:text-white font-mono text-xs font-medium text-[#E7D4BC]"
                  >
                    {storeSettings.phone_number}
                  </a>
                </div>
              )}

              {/* Email Link */}
              {storeSettings.support_email && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#3D3733]/60 border border-[#4A3E37]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#C6A36A] shrink-0" />
                    <span className="text-[#8A7465]">البريد:</span>
                  </div>
                  <a
                    href={`mailto:${storeSettings.support_email}`}
                    dir="ltr"
                    className="hover:text-white font-mono text-xs text-[#E7D4BC]"
                  >
                    {storeSettings.support_email}
                  </a>
                </div>
              )}

              {/* Address */}
              {storeSettings.boutique_address_ar && (
                <div className="flex items-start gap-2 pt-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A36A] shrink-0 mt-0.5" />
                  <span className="text-[#8A7465] shrink-0">العنوان:</span>
                  <span className="text-[#E7D4BC] leading-relaxed">
                    {storeSettings.boutique_address_ar}
                  </span>
                </div>
              )}

              {/* Working Hours */}
              {storeSettings.service_hours_ar && (
                <div className="flex items-center gap-2 text-[11px] text-[#A6998E]">
                  <Clock className="w-3.5 h-3.5 text-[#C6A36A] shrink-0" />
                  <span>{storeSettings.service_hours_ar}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: روابط سريعة (Navigation Links) - 2 Columns */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-[#F5E9D8] font-heading tracking-wide border-b border-[#4A3E37] pb-2 inline-block">
              روابط
            </h3>
            <ul className="space-y-2.5 text-xs text-[#C4B7AC]">
              <li>
                <button
                  onClick={() => handleLinkClick('store')}
                  className="hover:text-[#C6A36A] transition-colors flex items-center gap-1.5"
                >
                  <span>المتجر</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('wishlist')}
                  className="hover:text-[#C6A36A] transition-colors flex items-center gap-1.5"
                >
                  <span>المفضلة</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('orders')}
                  className="hover:text-[#C6A36A] transition-colors flex items-center gap-1.5"
                >
                  <span>طلباتي</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('store')}
                  className="hover:text-[#C6A36A] transition-colors flex items-center gap-1.5"
                >
                  <span>السياسات وطرق الدفع</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('admin')}
                  className="text-[#C6A36A] hover:underline font-semibold flex items-center gap-1.5"
                >
                  <span>لوحة إدارة المتجر</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Section 3: تعهدات ميني بازار (Commitments) - 3 Columns */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold text-[#F5E9D8] font-heading tracking-wide border-b border-[#4A3E37] pb-2 inline-block">
              تعهدات ميني بازار
            </h3>
            <div className="space-y-2.5 text-xs text-[#C4B7AC]">
              {commitments.map((com) => (
                <div key={com.id} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A36A] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{com.text_ar}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Payment Methods & Copyright & Designer Signature */}
        <div className="pt-8 space-y-6">
          {/* Payment Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-[#8A7465] ml-2">طرق الدفع المعتمدة:</span>
            {paymentMethods.map((pm, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-[#3D3733] text-[11px] font-bold text-[#E7D4BC] border border-[#4A3E37] shadow-xs"
              >
                {pm}
              </span>
            ))}
          </div>

          {/* Copyright & Designer Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A6998E] border-t border-[#4A3E37]/60 pt-6">
            <p className="text-center sm:text-right">
              {storeSettings.footer_copyright_ar ||
                `© ${new Date().getFullYear()} ${storeSettings.store_name_ar} — جميع الحقوق محفوظة.`}
            </p>

            {showDesignerCredit && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3D3733] border border-[#5A4538] text-[#C6A36A] font-medium text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A36A]" />
                <span>{designerCredit}</span>
              </div>
            )}

            <button
              onClick={scrollToTop}
              aria-label="العودة لأعلى الصفحة"
              className="w-8 h-8 rounded-full bg-[#3D3733] hover:bg-[#4A3E37] text-[#C6A36A] flex items-center justify-center transition-colors"
              title="العودة للأعلى"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
