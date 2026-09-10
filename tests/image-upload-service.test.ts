import { describe, it, expect } from 'vitest';
import {
  imageUploadService,
  TemplatePreviewUploadProvider,
  IImageUploadProvider,
  ImageUploadOptions,
  ImageUploadResult,
} from '../src/services/imageUploadService';

describe('imageUploadService', () => {
  it('should initialize with template_preview_only as the default active provider', () => {
    const provider = imageUploadService.getProvider();
    expect(provider).toBeDefined();
    expect(provider.name).toBe('template_preview_only');
    expect(provider.isPermanent).toBe(false);
  });

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

    const fakeBlob = new Blob(['fake content'], { type: 'image/jpeg' });
    const result = await imageUploadService.upload(fakeBlob, { folder: 'products' });

    expect(result.success).toBe(true);
    expect(result.url).toBe('https://custom-hostinger-cdn.com/products/uploaded.jpg');
    expect(result.isPermanent).toBe(true);
    expect(result.provider).toBe('hostinger_custom');

    // Switch back to default
    imageUploadService.setProvider(new TemplatePreviewUploadProvider());
    expect(imageUploadService.getProvider().name).toBe('template_preview_only');
    expect(imageUploadService.getProvider().isPermanent).toBe(false);
  });

  it('should correctly identify non-permanent local previews', () => {
    expect(imageUploadService.isPermanentUrl('data:image/jpeg;base64,12345')).toBe(false);
    expect(imageUploadService.isPermanentUrl('blob:http://localhost:3000/xyz')).toBe(false);
    expect(imageUploadService.isPermanentUrl('https://images.unsplash.com/sample.jpg')).toBe(true);
    expect(imageUploadService.isPermanentUrl('http://example.com/logo.png')).toBe(true);
  });

  it('should fail cleanly and report error when given invalid input (no fake success)', async () => {
    const result = await imageUploadService.upload(null as unknown as File);
    expect(result.success).toBe(false);
    expect(result.url).toBe('');
    expect(result.error).toBeDefined();
  });
});
