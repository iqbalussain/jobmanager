-- Create customer_contacts table first
CREATE TABLE customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_contacts
CREATE POLICY "Enable read access for authenticated users" ON customer_contacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON customer_contacts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON customer_contacts
  FOR UPDATE TO authenticated USING (true);

-- Add indexes
CREATE INDEX idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX idx_customer_contacts_name ON customer_contacts(contact_name);

-- Update trigger
CREATE TRIGGER update_customer_contacts_updated_at
  BEFORE UPDATE ON customer_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Now add columns to quotations table
ALTER TABLE quotations ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE quotations ADD COLUMN client_contact_id uuid REFERENCES customer_contacts(id);