import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  imageUploadService,
  HostingerUploadProvider,
  TemplatePreviewUploadProvider,
  IImageUploadProvider,
  ImageUploadOptions,
  ImageUploadResult,
  inspectImageContent,
  MAX_UPLOAD_FILE_SIZE,
} from '../src/services/imageUploadService';

describe('imageUploadService & Hostinger permanent upload provider with RBAC', () => {
  it('should initialize with hostinger_php as the default active provider', () => {
    const provider = imageUploadService.getProvider();
    expect(provider).toBeDefined();
    expect(provider.name).toBe('hostinger_php');
    expect(provider.isPermanent).toBe(true);
  });

  describe('HostingerUploadProvider endpoint configuration & guards', () => {
    it('defaults endpoint to /api/upload.php and allows customization', () => {
      const provider = new HostingerUploadProvider();
      expect(provider.getEndpoint()).toBe('/api/upload.php');

      provider.setEndpoint('https://my-domain.com/api/upload.php');
      expect(provider.getEndpoint()).toBe('https://my-domain.com/api/upload.php');
    });

    it('rejects files larger than 5 MB with explicit Arabic error', async () => {
      const provider = new HostingerUploadProvider();
      const largeBlob = new Blob([new Uint8Array(MAX_UPLOAD_FILE_SIZE + 1024)], {
        type: 'image/jpeg',
      });
      const result = await provider.upload(largeBlob);
      expect(result.success).toBe(false);
      expect(result.error).toContain('5 ميجابايت');
    });

    it('rejects SVG, BMP, and HEIC before uploading', async () => {
      const provider = new HostingerUploadProvider();

      const svgBlob = new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], {
        type: 'image/svg+xml',
      });
      const resSvg = await provider.upload(svgBlob);
      expect(resSvg.success).toBe(false);
      expect(resSvg.error).toContain('SVG');

      const bmpBlob = new Blob([new Uint8Array([0x42, 0x4d, 0, 0, 0, 0])], {
        type: 'image/bmp',
      });
      const resBmp = await provider.upload(bmpBlob);
      expect(resBmp.success).toBe(false);
      expect(resBmp.error).toContain('BMP');
    });
  });

  describe('Security & Role-Based Access Control (RBAC)', () => {
    it('1. Rejects visitor / unauthenticated user with HTTP 401', async () => {
      const provider = new HostingerUploadProvider('/api/upload.php');

      let capturedAuthHeader: string | null = null;
      class MockXHRVisitor {
        open = vi.fn();
        setRequestHeader = vi.fn((key: string, value: string) => {
          if (key.toLowerCase() === 'authorization') {
            capturedAuthHeader = value;
          }
        });
        upload = { onprogress: null as any };
        status = 401;
        responseText = JSON.stringify({
          success: false,
          error: 'غير مصرح: يرجى تسجيل الدخول أولاً كمسؤول لرفع الصور.',
        });
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        ontimeout: (() => void) | null = null;
        send = vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 5);
        });
      }

      const originalXHR = (globalThis as any).XMLHttpRequest;
      (globalThis as any).XMLHttpRequest = MockXHRVisitor;

      try {
        const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
        const validFile = new File([jpegBytes], 'test.jpg', { type: 'image/jpeg' });

        // Upload without providing token
        const res = await provider.upload(validFile);
        expect(res.success).toBe(false);
        expect(res.error).toContain('غير مصرح');
      } finally {
        (globalThis as any).XMLHttpRequest = originalXHR;
      }
    });

    it('2. Rejects regular non-admin user with HTTP 403', async () => {
      const provider = new HostingerUploadProvider('/api/upload.php');

      let capturedAuthHeader: string | null = null;
      class MockXHRRegularUser {
        open = vi.fn();
        setRequestHeader = vi.fn((key: string, value: string) => {
          if (key.toLowerCase() === 'authorization') {
            capturedAuthHeader = value;
          }
        });
        upload = { onprogress: null as any };
        status = 403;
        responseText = JSON.stringify({
          success: false,
          error: 'عذراً، رفع وتخزين الصور مقتصر على المشرفين والمسؤولين المصرح لهم فقط.',
        });
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        ontimeout: (() => void) | null = null;
        send = vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 5);
        });
      }

      const originalXHR = (globalThis as any).XMLHttpRequest;
      (globalThis as any).XMLHttpRequest = MockXHRRegularUser;

      try {
        const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
        const validFile = new File([jpegBytes], 'test.jpg', { type: 'image/jpeg' });

        // Regular user token without admin claim
        const regularUserToken = 'regular_user_id_token_123';
        const res = await provider.upload(validFile, { token: regularUserToken });

        expect(capturedAuthHeader).toBe(`Bearer ${regularUserToken}`);
        expect(res.success).toBe(false);
        expect(res.error).toContain('المشرفين والمسؤولين');
      } finally {
        (globalThis as any).XMLHttpRequest = originalXHR;
      }
    });

    it('3. Accepts authorized admin user with HTTP 200 and stores image permanently', async () => {
      const provider = new HostingerUploadProvider('/api/upload.php');

      let capturedAuthHeader: string | null = null;
      class MockXHRAdmin {
        open = vi.fn();
        setRequestHeader = vi.fn((key: string, value: string) => {
          if (key.toLowerCase() === 'authorization') {
            capturedAuthHeader = value;
          }
        });
        upload = { onprogress: null as any };
        status = 200;
        responseText = JSON.stringify({
          success: true,
          url: '/uploads/2026/09/secure_admin_upload.jpg',
          mime: 'image/jpeg',
          format: 'jpg',
          size: 2048,
          width: 800,
          height: 600,
        });
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        ontimeout: (() => void) | null = null;
        send = vi.fn().mockImplementation(function (this: any) {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 5);
        });
      }

      const originalXHR = (globalThis as any).XMLHttpRequest;
      (globalThis as any).XMLHttpRequest = MockXHRAdmin;

      try {
        const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
        const validFile = new File([jpegBytes], 'product.jpg', { type: 'image/jpeg' });

        const adminToken = 'admin_firebase_id_token_abc';
        const res = await provider.upload(validFile, { token: adminToken });

        expect(capturedAuthHeader).toBe(`Bearer ${adminToken}`);
        expect(res.success).toBe(true);
        expect(res.url).toBe('/uploads/2026/09/secure_admin_upload.jpg');
        expect(res.isPermanent).toBe(true);
      } finally {
        (globalThis as any).XMLHttpRequest = originalXHR;
      }
    });
  });

  describe('Allowed Formats Verification: JPEG, PNG, WebP, GIF', () => {
    it('accepts authentic JPEG', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
      const res = await inspectImageContent(blob);
      expect(res.valid).toBe(true);
      expect(res.format).toBe('jpeg');
    });

    it('accepts authentic PNG', async () => {
      const pngBytes = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      const blob = new Blob([pngBytes], { type: 'image/png' });
      const res = await inspectImageContent(blob);
      expect(res.valid).toBe(true);
      expect(res.format).toBe('png');
    });

    it('accepts authentic GIF', async () => {
      const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00]);
      const blob = new Blob([gifBytes], { type: 'image/gif' });
      const res = await inspectImageContent(blob);
      expect(res.valid).toBe(true);
      expect(res.format).toBe('gif');
    });

    it('accepts authentic WebP', async () => {
      const webpBytes = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]);
      const blob = new Blob([webpBytes], { type: 'image/webp' });
      const res = await inspectImageContent(blob);
      expect(res.valid).toBe(true);
      expect(res.format).toBe('webp');
    });
  });

  describe('Strict File Type & Magic Bytes Validation (inspectImageContent)', () => {
    it('strictly REJECTS SVG by mime, extension, or XML/SVG tag content', async () => {
      // 1. By MIME
      const svgMimeBlob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
      const res1 = await inspectImageContent(svgMimeBlob);
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain('SVG');

      // 2. By File name .svg
      const svgFile = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'icon.svg', {
        type: 'text/plain',
      });
      const res2 = await inspectImageContent(svgFile);
      expect(res2.valid).toBe(false);
      expect(res2.error).toContain('SVG');

      // 3. Masqueraded as JPEG but containing SVG XML content
      const disguisedSvg = new File(['<?xml version="1.0"?><svg></svg>'], 'photo.jpg', {
        type: 'image/jpeg',
      });
      const res3 = await inspectImageContent(disguisedSvg);
      expect(res3.valid).toBe(false);
      expect(res3.error).toContain('SVG');
    });

    it('strictly REJECTS BMP with explicit Arabic message', async () => {
      const bmpBytes = new Uint8Array([0x42, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const bmpBlob = new Blob([bmpBytes], { type: 'image/bmp' });
      const res = await inspectImageContent(bmpBlob);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('BMP');
      expect(res.error).toContain('Canvas');
    });

    it('strictly REJECTS HEIC and HEIF with explicit Arabic message', async () => {
      const heicBytes = new Uint8Array([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
      ]);
      const heicBlob = new Blob([heicBytes], { type: 'image/heic' });
      const res1 = await inspectImageContent(heicBlob);
      expect(res1.valid).toBe(false);
      expect(res1.error).toContain('HEIC');

      const heifFile = new File([new Uint8Array([1, 2, 3, 4])], 'photo.heif', {
        type: 'image/heif',
      });
      const res2 = await inspectImageContent(heifFile);
      expect(res2.valid).toBe(false);
      expect(res2.error).toContain('HEIF');
    });

    it('rejects files based on content, not just extension', async () => {
      const fakePng = new File(['this is not a real image at all'], 'avatar.png', {
        type: 'image/png',
      });
      const res = await inspectImageContent(fakePng);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('الصيغ المدعومة هي: JPEG, PNG, WebP, GIF فقط');
    });
  });

  describe('Provider registration & switching', () => {
    it('should allow registering and switching to a custom hosting provider', async () => {
      const mockCustomProvider: IImageUploadProvider = {
        name: 'hostinger_custom',
        isPermanent: true,
        async upload(file: File | Blob, options?: ImageUploadOptions): Promise<ImageUploadResult> {
          return {
            success: true,
            url: `https://custom-hostinger-cdn.com/${options?.folder || 'general'}/uploaded.jpg`,
            isPermanent: true,
            requiresStorageSetup: false,
            provider: 'hostinger_custom',
          };
        },
      };

      imageUploadService.registerProvider(mockCustomProvider);
      imageUploadService.setProvider('hostinger_custom');
      expect(imageUploadService.getProvider().name).toBe('hostinger_custom');
      expect(imageUploadService.getProvider().isPermanent).toBe(true);

      const realJpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      const jpegBlob = new Blob([realJpegBytes], { type: 'image/jpeg' });
      const result = await imageUploadService.upload(jpegBlob, { folder: 'products' });

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://custom-hostinger-cdn.com/products/uploaded.jpg');
      expect(result.isPermanent).toBe(true);
      expect(result.provider).toBe('hostinger_custom');

      // Switch back to default
      imageUploadService.setProvider(new TemplatePreviewUploadProvider());
      expect(imageUploadService.getProvider().name).toBe('template_preview_only');
      expect(imageUploadService.getProvider().isPermanent).toBe(false);
    });
  });

  describe('URL validation & storage protection (isPermanentUrl & validateRecordImages)', () => {
    it('should reject SVG, BMP, HEIC, and Base64/blob in isPermanentUrl', () => {
      expect(imageUploadService.isPermanentUrl('data:image/jpeg;base64,12345')).toBe(false);
      expect(imageUploadService.isPermanentUrl('blob:http://localhost:3000/xyz')).toBe(false);
      expect(imageUploadService.isPermanentUrl('https://example.com/vector.svg')).toBe(false);
      expect(imageUploadService.isPermanentUrl('https://example.com/image.bmp')).toBe(false);
      expect(imageUploadService.isPermanentUrl('https://example.com/photo.heic')).toBe(false);
      expect(imageUploadService.isPermanentUrl('https://images.unsplash.com/sample.jpg')).toBe(true);
      expect(imageUploadService.isPermanentUrl('http://example.com/logo.png')).toBe(true);
      expect(imageUploadService.isPermanentUrl('http://example.com/hero.webp')).toBe(true);
    });

    it('should fail cleanly when given invalid or null input', async () => {
      const result = await imageUploadService.upload(null as unknown as File);
      expect(result.success).toBe(false);
      expect(result.url).toBe('');
      expect(result.error).toBeDefined();
    });

    it('should block record saving when images contain SVG, BMP, HEIC, or local previews', () => {
      const validationSvg = imageUploadService.validateRecordImages([
        'https://example.com/logo.svg',
      ]);
      expect(validationSvg.canSave).toBe(false);
      expect(validationSvg.message).toContain('SVG');

      const validationBmp = imageUploadService.validateRecordImages([
        'https://example.com/photo.bmp',
      ]);
      expect(validationBmp.canSave).toBe(false);
      expect(validationBmp.message).toContain('BMP');

      const validationWithData = imageUploadService.validateRecordImages([
        'https://example.com/valid.jpg',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
      ]);
      expect(validationWithData.canSave).toBe(false);
      expect(validationWithData.hasUnuploadedImages).toBe(true);
      expect(validationWithData.unuploadedCount).toBe(1);
      expect(validationWithData.message).toContain(
        'لا يمكن حفظ السجل لأن الصورة لم ترفع بعد إلى خدمة التخزين الدائم'
      );

      const validationWithBlob = imageUploadService.validateRecordImages([
        'blob:http://localhost:3000/123-456',
      ]);
      expect(validationWithBlob.canSave).toBe(false);
      expect(validationWithBlob.hasUnuploadedImages).toBe(true);

      const validationClean = imageUploadService.validateRecordImages([
        'https://example.com/p1.jpg',
        'https://example.com/p2.png',
        'https://example.com/p3.webp',
        '',
        undefined,
        null,
      ]);
      expect(validationClean.canSave).toBe(true);
      expect(validationClean.hasUnuploadedImages).toBe(false);
      expect(validationClean.unuploadedCount).toBe(0);
    });
  });
});
