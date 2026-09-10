import React, { ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear corrupt cart cache if needed
      localStorage.removeItem('mb_cart');
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleBackToHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FBF8F3] text-[#2F2B28] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-[26px] border border-[#E5D8C9] p-8 shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#F4ECE2] text-[#B4574A] flex items-center justify-center mx-auto mb-4 border border-[#E7D4BC]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-[#2F2B28] font-heading mb-2">
              حدث تنبيه غير متوقع أثناء العرض
            </h2>

            <p className="text-xs text-[#7C736D] leading-relaxed mb-6">
              تمت حماية الجلسة وإعادة ضبط البيانات بأمان. يمكنك إعادة تحميل الصفحة أو العودة للمتجر مباشرة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs transition-all"
              >
                <RotateCcw className="w-4 h-4 text-[#C6A36A]" />
                <span>إعادة تحديث الصفحة</span>
              </button>

              <button
                onClick={this.handleBackToHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] text-xs font-bold border border-[#D9C1A7] transition-all"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

