-- Add accent_color to rabbit_holes (hex string like '#3b82f6')
ALTER TABLE social_art.rabbit_holes
ADD COLUMN IF NOT EXISTS accent_color TEXT;
