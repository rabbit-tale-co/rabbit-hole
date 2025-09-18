-- Add avatar_url and cover_url columns to rabbit_holes table
ALTER TABLE social_art.rabbit_holes
ADD COLUMN avatar_url TEXT,
ADD COLUMN cover_url TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_avatar_url ON social_art.rabbit_holes(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_cover_url ON social_art.rabbit_holes(cover_url) WHERE cover_url IS NOT NULL;
