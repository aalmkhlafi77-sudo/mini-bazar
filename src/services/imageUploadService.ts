/**
 * Image Upload Service Interface & Pluggable Architecture (Mini-Bazar Template)
 * 
 * Strict architectural boundaries:
 * - Local client-side processing (FileReader / Canvas) is for PREVIEW ONLY.
 * - Local Storage, Session Storage, and IndexedDB are NEVER used as permanent image storage.
 * - Base64 strings are strictly forbidden from being saved to Firestore.
 * - The service provides an interface (IImageUploadProvider) to connect to a real hosting
 *   upload endpoint (e.g. Hostinger PHP/Node API, S3, Cloudflare R2, custom VPS) when deployed.
 * - In the current template stage without a permanent provider configured:
 *   Returns explicit status: "تم اختيار الصورة ومعاينتها، لكن يلزم إعداد خدمة التخزين قبل الحفظ النهائي".
 * - External image URLs (http:// or https://) remain supported as a secondary option.
 */

export interface ImageUploadOptions {
  folder?: 'products' | 'hero' | 'categories' | 'brands' | 'general' | 'receipts' | 'logo';
  maxDimension?: number;
  quality?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface ImageUploadResult {
  success: boolean;
  url: string;
  isPermanent: boolean;
  requiresStorageSetup: boolean;
  message?: string;
  error?: string;
  provider: string;
  metadata?: {
    originalSize?: number;
    optimizedSize?: number;
    width?: number;
    height?: number;
    mimeType?: string;
  };
}

export interface IImageUploadProvider {
  name: string;
  /**
   * Indicates whether this provider uploads to a persistent remote server.
   * False in template preview mode.
   */
  isPermanent: boolean;
  upload(fileOrBlob: File | Blob, options?: ImageUploadOptions): Promise<ImageUploadResult>;
}

/**
 * Optimizes an image File or Blob client-side using Canvas for fast, lightweight preview.
 * This runs purely in browser memory for preview purposes.
 */
export async function optimizeImageClientSide(
  fileOrBlob: File | Blob,
  maxDimension: number = 1400,
  quality: number = 0.85
): Promise<{
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}> {
  return new Promise((resolve, reject) => {
    if (!fileOrBlob || !(fileOrBlob instanceof Blob)) {
      return reject(new Error('الملف المحدد غير صالح أو تالف'));
    }

    if (fileOrBlob.type && !fileOrBlob.type.startsWith('image/')) {
      return reject(new Error('الملف المحدد ليس صورة مدعومة. يرجى اختيار ملف صورة.'));
    }

    const originalSize = fileOrBlob.size;
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('تعذر قراءة ملف الصورة من الجهاز'));
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        reject(new Error('تعذر فك تشفير وتجهيز بيانات الصورة'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('تعذر إنشاء سياق معالجة الصورة (Canvas 2D)'));
          }

          ctx.drawImage(img, 0, 0, width, height);

          const isPng = fileOrBlob.type === 'image/png' || fileOrBlob.type === 'image/svg+xml';
          const exportMime = isPng ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(exportMime, quality);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  dataUrl,
                  blob,
                  width,
                  height,
                  originalSize,
                  optimizedSize: blob.size,
                });
              } else {
                const approxSize = Math.round((dataUrl.length * 3) / 4);
                resolve({
                  dataUrl,
                  blob: new Blob([dataUrl], { type: exportMime }),
                  width,
                  height,
                  originalSize,
                  optimizedSize: approxSize,
                });
              }
            },
            exportMime,
            quality
          );
        } catch (err: any) {
          reject(new Error(err?.message || 'فشلت معالجة الصورة'));
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Template Preview-Only Provider:
 * Used during the template stage when no dedicated remote storage server is connected.
 * Generates an in-memory preview so the user can interactively select, crop, and inspect images,
 * but explicitly flags that permanent storage is NOT configured yet.
 */
export class TemplatePreviewUploadProvider implements IImageUploadProvider {
  name = 'template_preview_only';
  isPermanent = false;

  async upload(
    fileOrBlob: File | Blob,
    options?: ImageUploadOptions
  ): Promise<ImageUploadResult> {
    try {
      if (options?.onProgress) options.onProgress(30);

      const maxDim = options?.maxDimension || 1200;
      const quality = options?.quality || 0.85;

      const result = await optimizeImageClientSide(fileOrBlob, maxDim, quality);

      if (options?.onProgress) options.onProgress(100);

      return {
        success: true,
        url: result.dataUrl,
        isPermanent: false,
        requiresStorageSetup: true,
        message: 'تم اختيار الصورة ومعاينتها، لكن يلزم إعداد خدمة التخزين قبل الحفظ النهائي',
        provider: this.name,
        metadata: {
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          width: result.width,
          height: result.height,
          mimeType: result.blob.type,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        url: '',
        isPermanent: false,
        requiresStorageSetup: true,
        error: err?.message || 'فشلت معالجة ملف الصورة',
        provider: this.name,
      };
    }
  }
}

/**
 * Image Upload Service Manager
 * Decouples image picking & previewing from actual storage backend.
 */
class ImageUploadService {
  private activeProvider: IImageUploadProvider = new TemplatePreviewUploadProvider();
  private registeredProviders = new Map<string, IImageUploadProvider>();

  constructor() {
    this.registerProvider(this.activeProvider);
  }

  /**
   * Register a custom storage provider (e.g., Hostinger custom API, AWS S3, Cloudflare R2)
   */
  registerProvider(provider: IImageUploadProvider): void {
    this.registeredProviders.set(provider.name, provider);
  }

  /**
   * Set the active provider to be used for uploads
   */
  setProvider(providerOrName: IImageUploadProvider | string): void {
    if (typeof providerOrName === 'string') {
      const provider = this.registeredProviders.get(providerOrName);
      if (!provider) {
        throw new Error(`مزود رفع الصور "${providerOrName}" غير مسجل.`);
      }
      this.activeProvider = provider;
    } else {
      this.activeProvider = providerOrName;
      this.registerProvider(providerOrName);
    }
  }

  /**
   * Get the active upload provider
   */
  getProvider(): IImageUploadProvider {
    return this.activeProvider;
  }

  /**
   * Checks if permanent remote storage is configured
   */
  isPermanentStorageConfigured(): boolean {
    return this.activeProvider.isPermanent === true;
  }

  /**
   * Validates whether a given URL is a permanently hosted URL (external HTTP/HTTPS)
   * or a transient in-memory preview (DataURL / Blob).
   */
  isPermanentUrl(url?: string | null): boolean {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return true; // Empty is valid (optional image)
    }
    const cleanUrl = url.trim();
    // Data URLs and Blob URLs are strictly local/temporary
    if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
      return false;
    }
    // Remote URLs (http:// or https://) are hosted elsewhere
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return true;
    }
    return false;
  }

  /**
   * Validates a list of image URLs associated with a record before saving to cloud database.
   * If any image is an un-uploaded local preview (Base64/blob), it prevents permanent saving.
   */
  validateRecordImages(imageUrls: (string | undefined | null)[]): {
    canSave: boolean;
    hasUnuploadedImages: boolean;
    unuploadedCount: number;
    message?: string;
  } {
    const unuploaded = imageUrls.filter(
      (url) => url && typeof url === 'string' && (url.startsWith('data:') || url.startsWith('blob:'))
    );

    if (unuploaded.length > 0) {
      return {
        canSave: false,
        hasUnuploadedImages: true,
        unuploadedCount: unuploaded.length,
        message: 'تم اختيار الصورة ومعاينتها، لكن يلزم إعداد خدمة التخزين قبل الحفظ النهائي',
      };
    }

    return {
      canSave: true,
      hasUnuploadedImages: false,
      unuploadedCount: 0,
    };
  }

  /**
   * Process and upload/preview an image file
   */
  async upload(
    fileOrBlob: File | Blob,
    options?: ImageUploadOptions
  ): Promise<ImageUploadResult> {
    if (!fileOrBlob) {
      return {
        success: false,
        url: '',
        isPermanent: false,
        requiresStorageSetup: true,
        error: 'لم يتم تحديد أي ملف للرفع',
        provider: this.activeProvider.name,
      };
    }
    return this.activeProvider.upload(fileOrBlob, options);
  }

  /**
   * Client-side optimization utility
   */
  async compress(
    fileOrBlob: File | Blob,
    maxDimension: number = 1200,
    quality: number = 0.85
  ) {
    return optimizeImageClientSide(fileOrBlob, maxDimension, quality);
  }
}

export const imageUploadService = new ImageUploadService();
