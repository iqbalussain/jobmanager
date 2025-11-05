import { supabase } from '@/integrations/supabase/client';
import { pdf } from '@react-pdf/renderer';
import { QuotationPDF } from '@/utils/pdf/quotation';

export interface QuotationContent {
  company: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  client: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  quotationNumber: string;
  date: string;
  validUntil?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
    total: number;
  }>;
  taxes: {
    subtotal: number;
    vatRate?: number;
    vatAmount?: number;
    total: number;
  };
  terms?: string;
  notes?: string;
  signature?: {
    name: string;
    title: string;
  };
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  salesman_id: string;
  status: string;
  total_amount: number;
  content?: QuotationContent;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationPayload {
  id?: string;
  customer_id: string;
  salesman_id: string;
  content: QuotationContent;
  notes?: string;
}

export const getQuotation = async (id: string): Promise<Quotation> => {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return {
    ...data,
    content: data.content as unknown as QuotationContent | undefined,
  };
};

export const saveQuotation = async (payload: QuotationPayload): Promise<Quotation> => {
  const user = await supabase.auth.getUser();
  if (!user.data.user) throw new Error('User not authenticated');

  const totalAmount = payload.content.taxes.total;

  if (payload.id) {
    // Update existing quotation
    const { data, error } = await supabase
      .from('quotations')
      .update({
        customer_id: payload.customer_id,
        salesman_id: payload.salesman_id,
        content: payload.content as any,
        total_amount: totalAmount,
        notes: payload.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      content: data.content as unknown as QuotationContent | undefined,
    };
  } else {
    // Create new quotation
    const { data: numberData, error: numberError } = await supabase
      .rpc('generate_quotation_number');

    if (numberError) throw numberError;

    const { data, error } = await supabase
      .from('quotations')
      .insert({
        quotation_number: numberData,
        customer_id: payload.customer_id,
        salesman_id: payload.salesman_id,
        content: payload.content as any,
        total_amount: totalAmount,
        notes: payload.notes,
        created_by: user.data.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      content: data.content as unknown as QuotationContent | undefined,
    };
  }
};

export const generateQuotationPDF = async (content: QuotationContent): Promise<Blob> => {
  const blob = await pdf(QuotationPDF({ content })).toBlob();
  return blob;
};

export const downloadQuotationPDF = async (content: QuotationContent, filename: string) => {
  const blob = await generateQuotationPDF(content);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
