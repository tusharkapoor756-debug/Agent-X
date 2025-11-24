-- Add offers support to business_profile table

ALTER TABLE business_profile 
ADD COLUMN IF NOT EXISTS offers_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS offers_text TEXT,
ADD COLUMN IF NOT EXISTS offer_rules_json JSONB DEFAULT '{}'::jsonb;

-- Comment on columns
COMMENT ON COLUMN business_profile.offers_enabled IS 'Toggle for business offers/freebies';
COMMENT ON COLUMN business_profile.offers_text IS 'Freeform Hinglish text describing offers and rules';
COMMENT ON COLUMN business_profile.offer_rules_json IS 'Structured JSON parsed from offers_text';
