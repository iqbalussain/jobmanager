import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const JOB_IMAGE_BUCKET = 'job-order-images';

export async function uploadJobImage(filePath: string, file: File): Promise<void> {
  const { error } = await supabase.storage.from(JOB_IMAGE_BUCKET).upload(filePath, file);
  if (error) throw error;
}

export async function getJobImageSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(JOB_IMAGE_BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error) throw error;
  if (!data.signedUrl) throw new Error('Unable to create a signed URL for the job image');
  return data.signedUrl;
}

export async function deleteJobImageFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(JOB_IMAGE_BUCKET).remove([filePath]);
  if (error) throw error;
}

export async function listJobImages(jobOrderId: string) {
  const { data, error } = await supabase
    .from('job_order_attachments')
    .select('id, file_name, file_path, file_size, file_type, image_width, image_height, alt_text, created_at, uploaded_by')
    .eq('job_order_id', jobOrderId)
    .eq('is_image', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addJobImageAttachment(attachment: TablesInsert<'job_order_attachments'>) {
  const { error } = await supabase.from('job_order_attachments').insert(attachment);
  if (error) throw error;
}

export async function getJobImagePath(imageId: string): Promise<string> {
  const { data, error } = await supabase
    .from('job_order_attachments')
    .select('file_path')
    .eq('id', imageId)
    .single();

  if (error) throw error;
  return data.file_path;
}

export async function deleteJobImageAttachment(imageId: string): Promise<void> {
  const { error } = await supabase
    .from('job_order_attachments')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
}

export async function updateJobImageAttachment(
  imageId: string,
  updates: TablesUpdate<'job_order_attachments'>,
): Promise<void> {
  const { error } = await supabase
    .from('job_order_attachments')
    .update(updates)
    .eq('id', imageId);

  if (error) throw error;
}
