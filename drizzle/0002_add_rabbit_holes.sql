-- Tworzenie tabeli rabbit_holes w schemacie social_art
CREATE TABLE IF NOT EXISTS social_art.rabbit_holes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rules TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT rabbit_holes_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT rabbit_holes_unique_name_per_user UNIQUE (name, owner_id)
);

-- Indeksy dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_owner_id ON social_art.rabbit_holes(owner_id);
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_created_at ON social_art.rabbit_holes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_name ON social_art.rabbit_holes(name);

-- RLS (Row Level Security) - tylko właściciel może zarządzać swoimi rabbit holes
ALTER TABLE social_art.rabbit_holes ENABLE ROW LEVEL SECURITY;

-- Policy: użytkownicy mogą widzieć wszystkie rabbit holes (do czytania postów)
CREATE POLICY "Anyone can view rabbit holes" ON social_art.rabbit_holes
    FOR SELECT USING (true);

-- Policy: tylko właściciel może tworzyć swoje rabbit holes
CREATE POLICY "Users can create their own rabbit holes" ON social_art.rabbit_holes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy: tylko właściciel może aktualizować swoje rabbit holes
CREATE POLICY "Users can update their own rabbit holes" ON social_art.rabbit_holes
    FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: tylko właściciel może usuwać swoje rabbit holes
CREATE POLICY "Users can delete their own rabbit holes" ON social_art.rabbit_holes
    FOR DELETE USING (auth.uid() = owner_id);

-- Funkcja do automatycznego aktualizowania updated_at
CREATE OR REPLACE FUNCTION social_art.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger do automatycznego aktualizowania updated_at
CREATE TRIGGER update_rabbit_holes_updated_at
    BEFORE UPDATE ON social_art.rabbit_holes
    FOR EACH ROW
    EXECUTE FUNCTION social_art.update_updated_at_column();
