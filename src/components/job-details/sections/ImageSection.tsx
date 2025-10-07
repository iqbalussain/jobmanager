
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/image-upload/ImageUploader';
import { JobImageGallery } from '@/components/image-upload/JobImageGallery';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/utils/roleValidation';
import { Job } from '@/types/jobOrder';

interface ImageSectionProps {
  job: Job;
  isEditMode?: boolean;
}

export function ImageSection({ job, isEditMode = false }: ImageSectionProps) {
  const { user } = useAuth();
  
  // Check if user can upload images
  const canUpload = user && (
    hasPermission(user.role as any, 'canEditJobOrders') || 
    (job.created_by === user.id && hasPermission(user.role as any, 'canViewOwnJobOrders'))
  );

  const canEdit = user && hasPermission(user.role as any, 'canEditJobOrders');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reference Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <JobImageGallery 
          jobOrderId={job.id} 
          canEdit={canEdit}
        />
        
        {(isEditMode && canUpload) && (
          <div>
            <h4 className="text-sm font-medium mb-3">Upload New Images</h4>
            <ImageUploader 
              jobOrderId={job.id}
              maxFiles={5}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
