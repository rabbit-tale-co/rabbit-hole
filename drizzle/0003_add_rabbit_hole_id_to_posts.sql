-- Dodanie pola rabbit_hole_id do tabeli posts
ALTER TABLE social_art.posts
ADD COLUMN rabbit_hole_id UUID REFERENCES social_art.rabbit_holes(id) ON DELETE SET NULL;

-- Indeks dla lepszej wydajności zapytań o posty w rabbit holes
CREATE INDEX IF NOT EXISTS idx_posts_rabbit_hole_id ON social_art.posts(rabbit_hole_id);

-- Indeks dla zapytań o posty w rabbit holes z sortowaniem po dacie
CREATE INDEX IF NOT EXISTS idx_posts_rabbit_hole_created_at ON social_art.posts(rabbit_hole_id, created_at DESC);
