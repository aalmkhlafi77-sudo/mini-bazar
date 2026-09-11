import { imageUploadService } from '../services/imageUploadService';

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

/**
 * Upload an image File or Blob using the isolated imageUploadService.
 * Seamlessly handles compression and provider resolution without forcing Firebase Storage.
 */
export async function uploadImageToStorage(
  fileOrBlob: File | Blob,
  folder: 'products' | 'hero' | 'categories' | 'brands' | 'general' = 'general',
  onProgress?: UploadProgressCallback
): Promise<{ success: boolean; url: string; error?: string }> {
  return imageUploadService.upload(fileOrBlob, {
    folder,
    onProgress,
  });
}
