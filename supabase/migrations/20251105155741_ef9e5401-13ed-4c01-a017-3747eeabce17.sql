-- Add JSONB content column to quotations table for flexible quotation data
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS content JSONB;

-- Add index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_quotations_content ON quotations USING gin(content);

-- Add comment explaining the JSONB structure
COMMENT ON COLUMN quotations.content IS 'Flexible quotation content: { company: {name, logo, contact}, client: {name, address, contact}, items: [], taxes: {subtotal, vat, total}, terms, validUntil, signature: {name, title} }';