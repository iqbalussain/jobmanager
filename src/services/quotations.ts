import { supabase } from '@/integrations/supabase/client';
import { pdf } from '@react-pdf/renderer';
import { QuotationPDF } from '@/utils/pdf/quotation';

export interface QuotationContent {
  company: {
    id?: string;
    name: string;
    logo?: string;
    letterhead_url?: string;
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
  company_id?: string;
  client_name?: string;
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

  const CASH_CUSTOMER_ID = "00000000-0000-0000-0000-000000000001";
  const totalAmount = payload.content.taxes.total;
  let clientContactId: string | null = null;

  // Handle client contact for Cash Customer
  if (payload.customer_id === CASH_CUSTOMER_ID && payload.client_name) {
    const { data: existingContact } = await supabase
      .from('customer_contacts')
      .select('id')
      .eq('customer_id', CASH_CUSTOMER_ID)
      .eq('contact_name', payload.client_name)
      .single();

    if (existingContact) {
      clientContactId = existingContact.id;
    } else {
      const { data: newContact, error: contactError } = await supabase
        .from('customer_contacts')
        .insert({
          customer_id: CASH_CUSTOMER_ID,
          contact_name: payload.client_name,
        })
        .select('id')
        .single();

      if (contactError) throw contactError;
      clientContactId = newContact.id;
    }
  }

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
        company_id: payload.company_id || null,
        client_contact_id: clientContactId,
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
        company_id: payload.company_id || null,
        client_contact_id: clientContactId,
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
