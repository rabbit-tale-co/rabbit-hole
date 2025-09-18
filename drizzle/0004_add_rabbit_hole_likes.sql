-- Dodanie tabeli do śledzenia polubień Rabbit Holes
CREATE TABLE social_art.rabbit_hole_likes (
  rabbit_hole_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT social_art.now_utc(),
  CONSTRAINT rabbit_hole_likes_pkey PRIMARY KEY (user_id, rabbit_hole_id),
  CONSTRAINT rabbit_hole_likes_rabbit_hole_id_fkey FOREIGN KEY (rabbit_hole_id) REFERENCES social_art.rabbit_holes(id) ON DELETE CASCADE,
  CONSTRAINT rabbit_hole_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indeks dla lepszej wydajności zapytań o polubienia Rabbit Holes
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_likes_rabbit_hole_id ON social_art.rabbit_hole_likes(rabbit_hole_id);
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_likes_user_id ON social_art.rabbit_hole_likes(user_id);

-- Dodanie kolumny like_count do tabeli rabbit_holes
ALTER TABLE social_art.rabbit_holes
ADD COLUMN like_count integer NOT NULL DEFAULT 0;

-- Indeks dla sortowania po liczbie polubień
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_like_count ON social_art.rabbit_holes(like_count DESC);
