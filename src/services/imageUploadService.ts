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
  folder?: 'products' | 'hero' | 'categories' | 'brands' | 'general' | 'receipts' | 'logo' | string;
  maxDimension?: number;
  quality?: number;
  onProgress?: (progressPercent: number) => void;
  token?: string;
}

export type AllowedImageFormat = 'jpeg' | 'png' | 'webp' | 'gif';

export interface ImageContentValidationResult {
  valid: boolean;
  format?: AllowedImageFormat;
  error?: string;
}

/**
 * Inspects both file metadata and raw binary magic bytes to ensure file authenticity.
 * Strictly accepts ONLY JPEG, PNG, WebP, GIF.
 * Strictly rejects SVG, BMP, HEIC, HEIF with explicit Arabic guidance.
 */
export async function inspectImageContent(fileOrBlob: File | Blob): Promise<ImageContentValidationResult> {
  if (!fileOrBlob || !(fileOrBlob instanceof Blob)) {
    return { valid: false, error: 'الملف المحدد غير صالح أو غير موجود.' };
  }

  const fileName = (fileOrBlob as File).name || '';
  const mimeType = (fileOrBlob.type || '').toLowerCase().trim();

  // 1. Explicitly reject SVG by extension or MIME type
  if (mimeType.includes('svg') || /\.(svg|svgz)(\?|$)/i.test(fileName)) {
    return {
      valid: false,
      error: 'صيغة SVG غير مدعومة نهائياً لأسباب أمنية وتوافقية. يرجى استخدام صور JPEG أو PNG أو WebP أو GIF.',
    };
  }

  // 2. Explicitly reject BMP, HEIC, HEIF by extension or MIME type
  if (
    mimeType.includes('bmp') ||
    mimeType.includes('heic') ||
    mimeType.includes('heif') ||
    /\.(bmp|dib|heic|heif|heics|heifs)(\?|$)/i.test(fileName)
  ) {
    return {
      valid: false,
      error: 'صيغ BMP و HEIC و HEIF غير مدعومة حالياً لأنها غير مدعومة بشكل قياسي عبر جميع المتصفحات أو محرّك Canvas. يرجى استخدام أو تحويل الصورة إلى JPEG أو PNG أو WebP.',
    };
  }

  // 3. Inspect binary magic bytes from the raw file header (first 64 bytes)
  try {
    const slice = fileOrBlob.slice(0, 64);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (bytes.length < 4) {
      return {
        valid: false,
        error: 'الملف تالف أو غير مكتمل.',
      };
    }

    // Check if content contains XML/SVG tag text (e.g. <?xml or <svg)
    const textPreview = new TextDecoder('utf-8', { fatal: false }).decode(bytes).toLowerCase().trim();
    if (textPreview.startsWith('<?xml') || textPreview.startsWith('<svg') || textPreview.includes('<svg')) {
      return {
        valid: false,
        error: 'صيغة SVG غير مدعومة نهائياً لأسباب أمنية وتوافقية. يرجى استخدام صور JPEG أو PNG أو WebP أو GIF.',
      };
    }

    // Check for BMP magic bytes: 0x42, 0x4D ("BM")
    if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
      return {
        valid: false,
        error: 'صيغ BMP و HEIC و HEIF غير مدعومة حالياً لأنها غير مدعومة بشكل قياسي عبر جميع المتصفحات أو محرّك Canvas. يرجى استخدام أو تحويل الصورة إلى JPEG أو PNG أو WebP.',
      };
    }

    // Check for HEIC / HEIF ISOBMFF ftyp brand in first 16 bytes
    if (bytes.length >= 12) {
      const brandSlice = String.fromCharCode(...bytes.slice(4, 12));
      if (
        brandSlice.startsWith('ftyp') &&
        (brandSlice.includes('heic') ||
          brandSlice.includes('heix') ||
          brandSlice.includes('hevc') ||
          brandSlice.includes('heim') ||
          brandSlice.includes('heis') ||
          brandSlice.includes('mif1') ||
          brandSlice.includes('msf1'))
      ) {
        return {
          valid: false,
          error: 'صيغ BMP و HEIC و HEIF غير مدعومة حالياً لأنها غير مدعومة بشكل قياسي عبر جميع المتصفحات أو محرّك Canvas. يرجى استخدام أو تحويل الصورة إلى JPEG أو PNG أو WebP.',
        };
      }
    }

    // 4. Verify ONLY allowed formats by magic bytes:

    // JPEG: 0xFF, 0xD8, 0xFF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { valid: true, format: 'jpeg' };
    }

    // PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4E &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0D &&
      bytes[5] === 0x0A &&
      bytes[6] === 0x1A &&
      bytes[7] === 0x0A
    ) {
      return { valid: true, format: 'png' };
    }

    // GIF: "GIF87a" or "GIF89a"
    if (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38 &&
      (bytes[4] === 0x37 || bytes[4] === 0x39) &&
      bytes[5] === 0x61
    ) {
      return { valid: true, format: 'gif' };
    }

    // WebP: "RIFF" .... "WEBP"
    if (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return { valid: true, format: 'webp' };
    }

    return {
      valid: false,
      error: 'نوع الملف أو محتواه غير مدعوم. الصيغ المدعومة هي: JPEG, PNG, WebP, GIF فقط.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: 'تعذر فحص محتوى ملف الصورة: ' + (err?.message || 'خطأ غير معروف'),
    };
  }
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
  format: AllowedImageFormat;
}> {
  if (!fileOrBlob || !(fileOrBlob instanceof Blob)) {
    throw new Error('الملف المحدد غير صالح أو تالف');
  }

  // 1. Verify file content & magic bytes (strictly reject SVG, BMP, HEIC, HEIF)
  const inspection = await inspectImageContent(fileOrBlob);
  if (!inspection.valid) {
    throw new Error(inspection.error || 'الملف المحدد غير مدعوم');
  }

  const format = inspection.format || 'jpeg';
  const originalSize = fileOrBlob.size;

  return new Promise((resolve, reject) => {
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

          // Allowed outputs: image/png, image/webp, image/jpeg
          const exportMime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
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
                  format,
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
                  format,
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

export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Hostinger Business & PHP Endpoint Image Upload Provider
 * Sends multipart/form-data directly to the deployable PHP upload endpoint.
 * Default endpoint: /api/upload.php (configurable via VITE_UPLOAD_ENDPOINT).
 * Strictly enforces 5 MB limit and JPEG/PNG/WebP/GIF formats.
 */
export class HostingerUploadProvider implements IImageUploadProvider {
  name = 'hostinger_php';
  isPermanent = true;
  private endpoint: string;

  constructor(endpoint?: string) {
    const envEndpoint =
      typeof import.meta !== 'undefined' && (import.meta as any).env
        ? ((import.meta as any).env.VITE_UPLOAD_ENDPOINT as string | undefined)
        : undefined;
    this.endpoint = endpoint || envEndpoint || '/api/upload.php';
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  async upload(
    fileOrBlob: File | Blob,
    options?: ImageUploadOptions
  ): Promise<ImageUploadResult> {
    if (!fileOrBlob) {
      return {
        success: false,
        url: '',
        isPermanent: true,
        requiresStorageSetup: false,
        error: 'لم يتم تحديد أي ملف للرفع.',
        provider: this.name,
      };
    }

    // 1. File size limit guard (5 MB)
    if (fileOrBlob.size > MAX_UPLOAD_FILE_SIZE) {
      return {
        success: false,
        url: '',
        isPermanent: true,
        requiresStorageSetup: false,
        error: 'حجم ملف الصورة يتجاوز الحد الأقصى المسموح به (5 ميجابايت).',
        provider: this.name,
      };
    }

    // 2. Strict Magic Bytes & Content Inspection (Client-side pre-flight)
    const inspection = await inspectImageContent(fileOrBlob);
    if (!inspection.valid) {
      return {
        success: false,
        url: '',
        isPermanent: true,
        requiresStorageSetup: false,
        error: inspection.error || 'نوع الملف أو محتواه غير مدعوم. الصيغ المدعومة هي: JPEG, PNG, WebP, GIF فقط.',
        provider: this.name,
      };
    }

    // 3. Acquire Firebase ID Token if not explicitly provided
    let authToken = options?.token;
    if (!authToken) {
      try {
        const { auth } = await import('../firebase');
        if (auth && auth.currentUser) {
          authToken = await auth.currentUser.getIdToken();
        }
      } catch (err) {
        console.warn('Could not retrieve Firebase ID token for image upload:', err);
      }
    }

    // 4. Build multipart/form-data payload
    const formData = new FormData();
    const originalName = (fileOrBlob as File).name || `image.${inspection.format || 'jpg'}`;
    formData.append('image', fileOrBlob, originalName);
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    // 5. Send upload request via XMLHttpRequest for accurate progress tracking
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.endpoint, true);

      // Attach Authorization Bearer token
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }

      if (options?.onProgress) {
        options.onProgress(15);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(95, Math.round((event.loaded / event.total) * 100));
            options.onProgress?.(percent);
          }
        };
      }

      xhr.onload = () => {
        if (options?.onProgress) {
          options.onProgress(100);
        }

        let responseData: any = null;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch {
          responseData = null;
        }

        if (xhr.status >= 200 && xhr.status < 300 && responseData && responseData.success && responseData.url) {
          resolve({
            success: true,
            url: responseData.url,
            isPermanent: true,
            requiresStorageSetup: false,
            message: 'تم رفع الصورة وتخزينها بشكل دائم بنجاح.',
            provider: this.name,
            metadata: {
              originalSize: fileOrBlob.size,
              mimeType: responseData.mime,
              width: responseData.width,
              height: responseData.height,
            },
          });
        } else {
          // Provide clear, actionable Arabic error messages
          let errorMsg = responseData?.error;
          if (!errorMsg) {
            if (xhr.status === 401) {
              errorMsg = 'غير مصرح: يرجى تسجيل الدخول أولاً كمسؤول لرفع الصور.';
            } else if (xhr.status === 403) {
              errorMsg = 'عذراً، رفع وتخزين الصور مقتصر على المشرفين والمسؤولين المصرح لهم فقط.';
            } else if (xhr.status === 413) {
              errorMsg = 'حجم ملف الصورة يتجاوز الحد الأقصى المسموح به (5 ميجابايت).';
            } else if (xhr.status === 415) {
              errorMsg = 'صيغة الملف غير مدعومة على الخادم. يقبل الخادم صور JPEG و PNG و WebP و GIF فقط.';
            } else if (xhr.status === 404) {
              errorMsg = `نقطة رفع الصور غير متوفرة (${this.endpoint}). يرجى التأكد من رفع ملف api/upload.php على الاستضافة.`;
            } else {
              errorMsg = 'فشل الخادم في حفظ ملف الصورة الدائم. يرجى مراجعة إعدادات وأذونات مجلد التخزين.';
            }
          }

          resolve({
            success: false,
            url: '',
            isPermanent: true,
            requiresStorageSetup: false,
            error: errorMsg,
            provider: this.name,
          });
        }
      };

      xhr.onerror = () => {
        resolve({
          success: false,
          url: '',
          isPermanent: true,
          requiresStorageSetup: false,
          error: `تعذر الاتصال بخدمة رفع الصور (${this.endpoint}). يرجى التحقق من الاتصال بالشبكة وإعدادات الخادم.`,
          provider: this.name,
        });
      };

      xhr.ontimeout = () => {
        resolve({
          success: false,
          url: '',
          isPermanent: true,
          requiresStorageSetup: false,
          error: 'انتهت مهلة الاتصال بالخادم أثناء محاولة رفع الصورة.',
          provider: this.name,
        });
      };

      xhr.send(formData);
    });
  }
}

/**
 * Template Preview-Only Provider:
 * Used during local offline inspection when no permanent backend is desired.
 * Generates an in-memory preview so the user can inspect images,
 * but explicitly flags that permanent storage is NOT configured.
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
  private activeProvider: IImageUploadProvider;
  private registeredProviders = new Map<string, IImageUploadProvider>();

  constructor() {
    const hostingerProvider = new HostingerUploadProvider();
    const templateProvider = new TemplatePreviewUploadProvider();

    this.registerProvider(hostingerProvider);
    this.registerProvider(templateProvider);

    // Default to the permanent Hostinger PHP provider
    this.activeProvider = hostingerProvider;
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
   * Validates whether a given URL is a permanently hosted URL (external HTTP/HTTPS or relative upload path)
   * or a transient in-memory preview (DataURL / Blob).
   * Rejects SVG, BMP, HEIC, HEIF, and local temporary previews.
   */
  isPermanentUrl(url?: string | null): boolean {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return true; // Empty is valid (optional image)
    }
    const cleanUrl = url.trim();

    // SVG is strictly forbidden across all image operations
    if (cleanUrl.toLowerCase().includes('.svg') || cleanUrl.toLowerCase().includes('image/svg')) {
      return false;
    }

    // BMP, HEIC, HEIF are not supported
    if (
      /\.(bmp|dib|heic|heif|heics|heifs)(\?|$)/i.test(cleanUrl) ||
      cleanUrl.toLowerCase().includes('image/bmp') ||
      cleanUrl.toLowerCase().includes('image/heic')
    ) {
      return false;
    }

    // Data URLs and Blob URLs are strictly local/temporary
    if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
      return false;
    }

    // Relative permanent uploaded paths (e.g. /uploads/YYYY/MM/xxx.jpg or uploads/...)
    if (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('uploads/')) {
      return true;
    }

    // Remote hosted URLs (http:// or https://)
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return true;
    }

    // Root relative safe paths (e.g. /assets/...)
    if (cleanUrl.startsWith('/') && !cleanUrl.startsWith('//')) {
      return true;
    }

    return false;
  }

  /**
   * Validates a list of image URLs associated with a record before saving to cloud database.
   * If any image is SVG, BMP, HEIC, or an un-uploaded local preview (Base64/blob), it prevents saving.
   */
  validateRecordImages(imageUrls: (string | undefined | null)[]): {
    canSave: boolean;
    hasUnuploadedImages: boolean;
    unuploadedCount: number;
    message?: string;
  } {
    // 1. Strictly forbid SVG
    const hasSvg = imageUrls.some(
      (url) =>
        url &&
        typeof url === 'string' &&
        (url.toLowerCase().includes('.svg') || url.toLowerCase().includes('image/svg'))
    );
    if (hasSvg) {
      return {
        canSave: false,
        hasUnuploadedImages: false,
        unuploadedCount: 0,
        message: 'صيغة SVG غير مدعومة نهائياً لأسباب أمنية وتوافقية. يرجى استخدام صور JPEG أو PNG أو WebP أو GIF.',
      };
    }

    // 2. Strictly reject BMP, HEIC, HEIF
    const hasBmpOrHeic = imageUrls.some(
      (url) =>
        url &&
        typeof url === 'string' &&
        (/\.(bmp|dib|heic|heif|heics|heifs)(\?|$)/i.test(url) ||
          url.toLowerCase().includes('image/bmp') ||
          url.toLowerCase().includes('image/heic'))
    );
    if (hasBmpOrHeic) {
      return {
        canSave: false,
        hasUnuploadedImages: false,
        unuploadedCount: 0,
        message: 'صيغ BMP و HEIC و HEIF غير مدعومة حالياً لأنها غير مدعومة بشكل قياسي عبر جميع المتصفحات أو محرّك Canvas. يرجى استخدام أو تحويل الصورة إلى JPEG أو PNG أو WebP.',
      };
    }

    // 3. Prevent unuploaded local preview images (data: or blob:)
    const unuploaded = imageUrls.filter(
      (url) => url && typeof url === 'string' && (url.startsWith('data:') || url.startsWith('blob:'))
    );

    if (unuploaded.length > 0) {
      return {
        canSave: false,
        hasUnuploadedImages: true,
        unuploadedCount: unuploaded.length,
        message: 'لا يمكن حفظ السجل لأن الصورة لم ترفع بعد إلى خدمة التخزين الدائم (الرابط ما زال مؤقتاً).',
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

    // Inspect content and magic bytes first before calling provider
    const inspection = await inspectImageContent(fileOrBlob);
    if (!inspection.valid) {
      return {
        success: false,
        url: '',
        isPermanent: false,
        requiresStorageSetup: true,
        error: inspection.error,
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
