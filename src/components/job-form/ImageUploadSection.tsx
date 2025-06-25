
import React from 'react';
import { Label } from "@/components/ui/label";
import { ImageUploader } from '@/components/image-upload/ImageUploader';

interface ImageUploadSectionProps {
  jobOrderId?: string;
  disabled?: boolean;
}

export function ImageUploadSection({ jobOrderId, disabled = false }: ImageUploadSectionProps) {
  if (!jobOrderId) {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">Reference Images</Label>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Images can be uploaded after the job order is created
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Reference Images</Label>
      <div className="border border-gray-200 rounded-lg p-4">
        <ImageUploader 
          jobOrderId={jobOrderId}
          maxFiles={5}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
