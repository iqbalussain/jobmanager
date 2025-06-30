
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadOptions {
  maxSizeKB?: number;
  allowedTypes?: string[];
  jobOrderId: string;
}

interface ImageUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File, maxSizeKB = 150): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Please upload only JPEG or PNG images.' };
    }

    const maxSizeBytes = maxSizeKB * 1024;
    if (file.size > maxSizeBytes) {
      return { isValid: false, error: `File size must be less than ${maxSizeKB}KB. Current size: ${Math.round(file.size / 1024)}KB` };
    }

    return { isValid: true };
  };

  const compressImage = (file: File, maxSizeKB = 150): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions to maintain aspect ratio
        let { width, height } = img;
        const maxDimension = 800; // Max width or height
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.8 // Compression quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (
    file: File,
    options: ImageUploadOptions
  ): Promise<ImageUploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file
      const validation = validateFile(file, options.maxSizeKB);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Compress if needed
      let processedFile = file;
      if (file.size > (options.maxSizeKB || 150) * 1024) {
        processedFile = await compressImage(file, options.maxSizeKB);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create unique file path
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${user.id}/${options.jobOrderId}/${Date.now()}.${fileExt}`;

      setUploadProgress(50);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job-order-images')
        .upload(fileName, processedFile);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(75);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('job-order-images')
        .getPublicUrl(fileName);

      // Get image dimensions
      const img = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(processedFile);
      });

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('job_order_attachments')
        .insert({
          job_order_id: options.jobOrderId,
          file_name: processedFile.name,
          file_path: fileName,
          file_size: processedFile.size,
          file_type: processedFile.type,
          is_image: true,
          image_width: dimensions.width,
          image_height: dimensions.height,
          uploaded_by: user.id
        });

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('job-order-images').remove([fileName]);
        throw dbError;
      }

      setUploadProgress(100);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      return {
        success: true,
        url: publicUrl,
        path: fileName
      };

    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadProgress,
    validateFile,
    compressImage
  };
}
