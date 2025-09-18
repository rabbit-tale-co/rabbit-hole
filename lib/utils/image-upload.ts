/**
 * Image upload utilities for rabbit holes
 * Based on the profile upload system from discord bot
 */

export interface CropData {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image file to storage
 * @param file The image file to upload
 * @param folder The folder path in storage
 * @param cropData Optional crop data to apply
 * @returns Upload result with URL or error
 */
export async function uploadImage(
  file: File,
  folder: string,
  cropData?: CropData,
  baseUrl?: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only images are allowed."
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large. Maximum size is 10MB."
      };
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('postId', folder); // Use folder as postId
    formData.append('kind', 'image');
    formData.append('width', '0');
    formData.append('height', '0');
    formData.append('isCover', 'false');
    formData.append('alt', '');

    if (cropData) {
      formData.append('crop_x', cropData.x.toString());
      formData.append('crop_y', cropData.y.toString());
      formData.append('crop_w', cropData.w.toString());
      formData.append('crop_h', cropData.h.toString());
    }

    // Use existing upload endpoint
    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Upload failed'
      };
    }

    const result = await response.json();

    // Build public URL from path
    if (baseUrl) {
      const bucket = "social-art";
      const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${result.path}`;
      return {
        success: true,
        url: publicUrl
      };
    } else {
      // Fallback - return path if no baseUrl provided
      return {
        success: true,
        url: result.path
      };
    }

  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Processes and uploads multiple images
 * @param images Array of image files with metadata
 * @param rabbitHoleId The rabbit hole ID for folder structure
 * @returns Array of upload results
 */
export async function uploadMultipleImages(
  images: Array<{
    file: File;
    type: 'avatar' | 'cover';
    cropData?: CropData;
  }>,
  rabbitHoleId: string,
  baseUrl?: string
): Promise<Record<string, UploadResult>> {
  const results: Record<string, UploadResult> = {};

  const uploadPromises = images.map(async ({ file, type, cropData }) => {
    const folder = `rabbit-holes/${rabbitHoleId}/${type}`;
    const result = await uploadImage(file, folder, cropData, baseUrl);
    results[type] = result;
    return result;
  });

  await Promise.all(uploadPromises);
  return results;
}

/**
 * Validates image file
 * @param file The file to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File too large. Maximum size is 10MB."
    };
  }

  // Check file extension matches MIME type
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const expectedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  if (fileExt && !expectedExts.includes(fileExt)) {
    return {
      isValid: false,
      error: "File extension does not match image type."
    };
  }

  return { isValid: true };
}
