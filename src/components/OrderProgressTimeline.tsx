import React from 'react';
import {
  ShoppingBag,
  CheckCircle,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { OrderStatus, OrderStatusLog } from '../types';

interface OrderProgressTimelineProps {
  status: OrderStatus;
  logs?: OrderStatusLog[];
  onStatusChange?: (newStatus: OrderStatus) => void;
  isAdmin?: boolean;
  compact?: boolean;
}

interface TimelineStage {
  status: OrderStatus;
  stepIndex: number;
  label_ar: string;
  sublabel_ar: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: TimelineStage[] = [
  {
    status: 'new',
    stepIndex: 1,
    label_ar: 'استلام الطلب',
    sublabel_ar: 'تم تسجيل الطلب في المتجر',
    icon: ShoppingBag,
  },
  {
    status: 'confirmed',
    stepIndex: 2,
    label_ar: 'اعتماد الطلب',
    sublabel_ar: 'تم تأكيد الطلب والدفع',
    icon: CheckCircle,
  },
  {
    status: 'preparing',
    stepIndex: 3,
    label_ar: 'قيد التجهيز',
    sublabel_ar: 'فحص وتغليف البوكس الملكي',
    icon: Package,
  },
  {
    status: 'out_for_delivery',
    stepIndex: 4,
    label_ar: 'خرج للتوصيل',
    sublabel_ar: 'مع المندوب أو شركة الشحن',
    icon: Truck,
  },
  {
    status: 'delivered',
    stepIndex: 5,
    label_ar: 'تم التسليم',
    sublabel_ar: 'وصلت الشحنة للعميل بنجاح',
    icon: CheckCircle2,
  },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  new: 1,
  contacted: 1,
  confirmed: 2,
  preparing: 3,
  ready_for_delivery: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

export const OrderProgressTimeline: React.FC<OrderProgressTimelineProps> = ({
  status,
  logs = [],
  onStatusChange,
  isAdmin = false,
  compact = false,
}) => {
  const currentStep = STATUS_ORDER[status] ?? 1;
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="p-4 rounded-[16px] bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <span className="font-bold block text-sm">تم إلغاء هذا الطلب</span>
            <span className="text-[11px] text-red-700">
              تم إيقاف معالجة هذا الطلب ولا يمر بمراحل الشحن والتوصيل.
            </span>
          </div>
        </div>
        {isAdmin && onStatusChange && (
          <button
            type="button"
            onClick={() => onStatusChange('new')}
            className="px-3 py-1.5 rounded-[10px] bg-white border border-red-300 text-red-800 font-bold hover:bg-red-100 transition-colors"
          >
            إعادة تفعيل الطلب
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full rounded-[20px] bg-[#FBF8F3] border border-[#E7D4BC] ${compact ? 'p-3' : 'p-5'} text-right`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E5D8C9]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#C6A36A]" />
          <span className="text-xs font-bold text-[#6F584A] font-heading">
            شريط تقدم مراحل الطلب والتوصيل
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#7C736D]">المرحلة الحالية:</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#2F2B28] text-[#E7D4BC] border border-[#4A3E37]">
            {STAGES.find((s) => s.status === status)?.label_ar || status}
          </span>
        </div>
      </div>

      {/* Interactive / Visual Timeline Bar */}
      <div className="relative">
        {/* Progress connecting line for desktop */}
        <div className="hidden md:block absolute top-5 right-8 left-8 h-1 bg-[#E5D8C9] -z-0">
          <div
            className="h-full bg-[#C6A36A] transition-all duration-500 rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (STAGES.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-2 relative z-10">
          {STAGES.map((stage) => {
            const isCompleted = currentStep > stage.stepIndex;
            const isCurrent = currentStep === stage.stepIndex;
            const isPending = currentStep < stage.stepIndex;
            const StageIcon = stage.icon;

            // Find log timestamp if any
            const stageLog = logs.find((l) => l.to_status === stage.status);

            const content = (
              <div
                className={`flex md:flex-col items-center md:items-center justify-start md:justify-center gap-3 md:gap-2 p-2.5 md:p-2 rounded-[14px] transition-all ${
                  isCurrent
                    ? 'bg-white border-2 border-[#C6A36A] shadow-xs'
                    : isCompleted
                    ? 'bg-white/60 border border-[#D9C1A7]'
                    : 'bg-white/20 border border-dashed border-[#E5D8C9] opacity-60'
                } ${isAdmin && onStatusChange ? 'hover:scale-[1.02] cursor-pointer' : ''}`}
              >
                {/* Step Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-[#2F2B28] text-[#C6A36A] ring-4 ring-[#C6A36A]/30 shadow-md'
                      : isCompleted
                      ? 'bg-[#607866] text-white shadow-xs'
                      : 'bg-[#F4ECE2] text-[#8A7465]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StageIcon className="w-5 h-5" />
                  )}
                </div>

                {/* Stage Info */}
                <div className="text-right md:text-center flex-1 md:flex-initial">
                  <div className="flex items-center gap-1.5 md:justify-center">
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent
                          ? 'text-[#6F584A]'
                          : isCompleted
                          ? 'text-[#2F2B28]'
                          : 'text-[#8A7465]'
                      }`}
                    >
                      {stage.label_ar}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[#C6A36A] animate-ping shrink-0" />
                    )}
                  </div>

                  <span className="text-[10px] text-[#7C736D] block leading-tight mt-0.5">
                    {stage.sublabel_ar}
                  </span>

                  {stageLog && (
                    <span className="text-[9px] text-[#8A7465] font-mono block mt-1">
                      {new Date(stageLog.created_at).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {/* Admin Quick Action Button */}
                {isAdmin && onStatusChange && !isCurrent && (
                  <span className="text-[10px] text-[#C6A36A] font-bold border border-[#C6A36A]/40 rounded px-1.5 py-0.5 md:mt-1 hover:bg-[#C6A36A] hover:text-white transition-colors">
                    نقل للحالة
                  </span>
                )}
              </div>
            );

            if (isAdmin && onStatusChange) {
              return (
                <button
                  key={stage.status}
                  type="button"
                  onClick={() => onStatusChange(stage.status)}
                  className="w-full text-right outline-none"
                  title={`تغيير حالة الطلب إلى: ${stage.label_ar}`}
                >
                  {content}
                </button>
              );
            }

            return <div key={stage.status}>{content}</div>;
          })}
        </div>
      </div>
    </div>
  );
};
