-- Add missing columns to requests table
ALTER TABLE requests ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS budget_per_hectare numeric;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS image_urls text[];

-- Add missing columns to services table  
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_urls text[];

-- Update the images column in services to be compatible
-- (keep both for backward compatibility)

