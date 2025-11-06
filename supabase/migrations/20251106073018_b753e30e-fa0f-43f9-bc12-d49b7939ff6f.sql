-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  letterhead_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default company
INSERT INTO companies (name, address, phone, email) 
VALUES ('PrintWaves Oman', 'Muscat, Oman', '+968 1234 5678', 'info@printwavesoman.com');

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS policies for companies
CREATE POLICY "All authenticated users can view companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage companies"
  ON companies FOR ALL
  TO authenticated
  USING (get_current_user_role() = 'admin'::app_role);