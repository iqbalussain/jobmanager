
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Images can be uploaded after the job order is created
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG up to 150KB (max 5 files)
              </p>
            </div>
          </div>
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
