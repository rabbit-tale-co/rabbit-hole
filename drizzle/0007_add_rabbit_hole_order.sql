-- Tabela do przechowywania kolejności Rabbit Holes dla każdego użytkownika
CREATE TABLE social_art.rabbit_hole_order (
  user_id UUID NOT NULL,
  "order" JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT social_art.now_utc(),
  updated_at timestamp with time zone NOT NULL DEFAULT social_art.now_utc(),
  CONSTRAINT rabbit_hole_order_pkey PRIMARY KEY (user_id),
  CONSTRAINT rabbit_hole_order_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indeks dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_order_user_id ON social_art.rabbit_hole_order(user_id);
