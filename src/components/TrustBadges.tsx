import React from 'react';
import { Award, Gift, Truck, MessageCircle } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: Award,
      title: 'أصالة وجودة مختارة',
      description: 'قطع أصلية 100% صُنعت بأعلى معايير الحرفية والجلود الراقية.',
    },
    {
      icon: Gift,
      title: 'تغليف هدايا فاخر مجاناً',
      description: 'علبة مميزة مع شريط حريري وبطاقة إهداء مخصصة مع كل طلب.',
    },
    {
      icon: Truck,
      title: 'توصيل عناية وشحن سريع',
      description: 'تسليم فوري في اليوم نفسه بالرياض وشحن آمن لكافة مدن المملكة.',
    },
    {
      icon: MessageCircle,
      title: 'كونسيرج وخدمة عملاء واتساب',
      description: 'مساعدة شخصية فورية لاختيار القطعة والهدية الملائمة لذوقكِ.',
    },
  ];

  return (
    <section className="bg-[#F7F1E8]/70 py-10 px-4 sm:px-8 border-b border-[#E5D8C9]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-4 p-5 rounded-[20px] bg-white/80 backdrop-blur-xs border border-[#E7D4BC] shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="w-12 h-12 rounded-[14px] bg-[#F4ECE2] flex items-center justify-center shrink-0 text-[#C6A36A]">
                <Icon className="w-6 h-6 text-[#AE8951]" />
              </div>
              <div className="flex flex-col text-right">
                <h2 className="text-sm font-bold text-[#6F584A] mb-1 font-heading">
                  {b.title}
                </h2>
                <p className="text-xs text-[#5F5751] leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
