
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';

export const shareJobDetailsWhatsApp = async (job: Job) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const jobDetailsUrl = `${baseUrl}/job/${job.id}`;

  const message = encodeURIComponent(
    `*Job Order Details*\n\n` +
    `*Job Order Number:* ${job.jobOrderNumber}\n` +
    `*Title:* ${job.title}\n` +
    `*Customer:* ${job.customer}\n` +
    `*Status:* ${job.status}\n\n` +
    `View details: ${jobDetailsUrl}`
  );

  // Fetch the user's phone number from the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', job.created_by)
    .single();

  if (error) {
    console.error('Error fetching phone number:', error);
    return `https://wa.me/?text=${message}`; // Fallback to a generic WhatsApp share URL
  }

  const phoneNumber = data?.phone;

  if (!phoneNumber) {
    return `https://wa.me/?text=${message}`; // Fallback if phone number is not available
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  return whatsappUrl;
};

export const shareJobOrderViaWhatsApp = async (job: Job, invoiceNumber?: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const jobDetailsUrl = `${baseUrl}/job/${job.id}`;

  const invoiceInfo = invoiceNumber ? `*Invoice Number:* ${invoiceNumber}\n` : '';

  const message = encodeURIComponent(
    `*Job Order Details*\n\n` +
    `*Job Order Number:* ${job.jobOrderNumber}\n` +
    `*Title:* ${job.title}\n` +
    `*Customer:* ${job.customer}\n` +
    `*Status:* ${job.status}\n` +
    invoiceInfo +
    `\nView details: ${jobDetailsUrl}`
  );

  // Fetch the user's phone number from the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', job.created_by)
    .single();

  if (error) {
    console.error('Error fetching phone number:', error);
    return `https://wa.me/?text=${message}`; // Fallback to a generic WhatsApp share URL
  }

  const phoneNumber = data?.phone;

  if (!phoneNumber) {
    return `https://wa.me/?text=${message}`; // Fallback if phone number is not available
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};
