
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobImage {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  image_width: number | null;
  image_height: number | null;
  alt_text: string | null;
  created_at: string;
  uploaded_by: string;
}

export function useJobImages(jobOrderId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['job-images', jobOrderId],
    queryFn: async (): Promise<JobImage[]> => {
      const { data, error } = await supabase
        .from('job_order_attachments')
        .select('*')
        .eq('job_order_id', jobOrderId)
        .eq('is_image', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job images:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!jobOrderId
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      // First get the image details
      const { data: image, error: fetchError } = await supabase
        .from('job_order_attachments')
        .select('file_path')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('job-order-images')
        .remove([image.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('job_order_attachments')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      return imageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-images', jobOrderId] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    }
  });

  const updateAltTextMutation = useMutation({
    mutationFn: async ({ imageId, altText }: { imageId: string; altText: string }) => {
      const { error } = await supabase
        .from('job_order_attachments')
        .update({ alt_text: altText })
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-images', jobOrderId] });
      toast({
        title: "Success",
        description: "Image description updated",
      });
    },
    onError: (error: any) => {
      console.error('Error updating alt text:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update image description",
        variant: "destructive",
      });
    }
  });

  const getImageUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('job-order-images')
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    
    if (error || !data?.signedUrl) {
      console.error('Error getting signed URL:', error);
      return '';
    }
    return data.signedUrl;
  };

  return {
    images,
    isLoading,
    error,
    deleteImage: deleteImageMutation.mutate,
    isDeletingImage: deleteImageMutation.isPending,
    updateAltText: updateAltTextMutation.mutate,
    isUpdatingAltText: updateAltTextMutation.isPending,
    getImageUrl
  };
}
