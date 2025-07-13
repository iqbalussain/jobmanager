
import React from 'react';
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/image-upload/ImageUploader";
import { ArrowLeft, Check } from "lucide-react";

interface ImageUploadStepProps {
  jobOrderId: string;
  onBack: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export function ImageUploadStep({ jobOrderId, onBack, onComplete, onSkip }: ImageUploadStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Upload Job Images</h3>
          <p className="text-sm text-gray-600">
            Add images related to this job order (optional)
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        <ImageUploader
          jobOrderId={jobOrderId}
          onUploadComplete={onComplete}
          maxFiles={10}
        />
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1"
          >
            Skip Image Upload
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
}
