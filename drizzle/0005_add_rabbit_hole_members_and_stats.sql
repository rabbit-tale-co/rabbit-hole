-- Tabela członków Rabbit Holes z rolami
CREATE TABLE social_art.rabbit_hole_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  rabbit_hole_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('member', 'moderator', 'admin', 'owner')),
  joined_at timestamp with time zone NOT NULL DEFAULT social_art.now_utc(),
  is_liked boolean NOT NULL DEFAULT false,
  liked_at timestamp with time zone,
  CONSTRAINT rabbit_hole_members_pkey PRIMARY KEY (id),
  CONSTRAINT rabbit_hole_members_unique UNIQUE (rabbit_hole_id, user_id),
  CONSTRAINT rabbit_hole_members_rabbit_hole_id_fkey FOREIGN KEY (rabbit_hole_id) REFERENCES social_art.rabbit_holes(id) ON DELETE CASCADE,
  CONSTRAINT rabbit_hole_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indeksy dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_members_rabbit_hole_id ON social_art.rabbit_hole_members(rabbit_hole_id);
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_members_user_id ON social_art.rabbit_hole_members(user_id);
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_members_role ON social_art.rabbit_hole_members(role);
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_members_liked ON social_art.rabbit_hole_members(rabbit_hole_id, is_liked) WHERE is_liked = true;

-- Tabela statystyk Rabbit Holes
CREATE TABLE social_art.rabbit_hole_stats (
  rabbit_hole_id UUID NOT NULL,
  member_count integer NOT NULL DEFAULT 0,
  post_count integer NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  last_activity timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT social_art.now_utc(),
  CONSTRAINT rabbit_hole_stats_pkey PRIMARY KEY (rabbit_hole_id),
  CONSTRAINT rabbit_hole_stats_rabbit_hole_id_fkey FOREIGN KEY (rabbit_hole_id) REFERENCES social_art.rabbit_holes(id) ON DELETE CASCADE
);

-- Indeksy dla sortowania po statystykach
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_stats_member_count ON social_art.rabbit_hole_stats(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_stats_post_count ON social_art.rabbit_hole_stats(post_count DESC);
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_stats_like_count ON social_art.rabbit_hole_stats(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_rabbit_hole_stats_last_activity ON social_art.rabbit_hole_stats(last_activity DESC);

-- Dodaj kolumny do tabeli rabbit_holes
ALTER TABLE social_art.rabbit_holes
ADD COLUMN is_public boolean NOT NULL DEFAULT true,
ADD COLUMN member_count integer NOT NULL DEFAULT 0,
ADD COLUMN post_count integer NOT NULL DEFAULT 0,
ADD COLUMN like_count integer NOT NULL DEFAULT 0;

-- Indeksy dla nowych kolumn
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_is_public ON social_art.rabbit_holes(is_public);
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_member_count ON social_art.rabbit_holes(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_post_count ON social_art.rabbit_holes(post_count DESC);
CREATE INDEX IF NOT EXISTS idx_rabbit_holes_like_count ON social_art.rabbit_holes(like_count DESC);

-- Funkcja do aktualizacji statystyk Rabbit Hole
CREATE OR REPLACE FUNCTION social_art.update_rabbit_hole_stats(p_rabbit_hole_id UUID)
RETURNS void AS $$
BEGIN
  -- Aktualizuj statystyki w tabeli rabbit_holes
  UPDATE social_art.rabbit_holes SET
    member_count = (
      SELECT COUNT(*) FROM social_art.rabbit_hole_members
      WHERE rabbit_hole_id = p_rabbit_hole_id
    ),
    post_count = (
      SELECT COUNT(*) FROM social_art.posts
      WHERE rabbit_hole_id = p_rabbit_hole_id AND is_deleted = false
    ),
    like_count = (
      SELECT COUNT(*) FROM social_art.rabbit_hole_members
      WHERE rabbit_hole_id = p_rabbit_hole_id AND is_liked = true
    ),
    updated_at = social_art.now_utc()
  WHERE id = p_rabbit_hole_id;

  -- Aktualizuj statystyki w tabeli rabbit_hole_stats
  INSERT INTO social_art.rabbit_hole_stats (
    rabbit_hole_id, member_count, post_count, like_count, last_activity, updated_at
  ) VALUES (
    p_rabbit_hole_id,
    (SELECT COUNT(*) FROM social_art.rabbit_hole_members WHERE rabbit_hole_id = p_rabbit_hole_id),
    (SELECT COUNT(*) FROM social_art.posts WHERE rabbit_hole_id = p_rabbit_hole_id AND is_deleted = false),
    (SELECT COUNT(*) FROM social_art.rabbit_hole_members WHERE rabbit_hole_id = p_rabbit_hole_id AND is_liked = true),
    social_art.now_utc(),
    social_art.now_utc()
  )
  ON CONFLICT (rabbit_hole_id) DO UPDATE SET
    member_count = EXCLUDED.member_count,
    post_count = EXCLUDED.post_count,
    like_count = EXCLUDED.like_count,
    last_activity = EXCLUDED.last_activity,
    updated_at = social_art.now_utc();
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznej aktualizacji statystyk przy dodawaniu/usuwaniu członków
CREATE OR REPLACE FUNCTION social_art.trigger_update_rabbit_hole_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM social_art.update_rabbit_hole_stats(NEW.rabbit_hole_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM social_art.update_rabbit_hole_stats(OLD.rabbit_hole_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla rabbit_hole_members
CREATE TRIGGER trigger_rabbit_hole_members_stats
  AFTER INSERT OR UPDATE OR DELETE ON social_art.rabbit_hole_members
  FOR EACH ROW EXECUTE FUNCTION social_art.trigger_update_rabbit_hole_stats();

-- Trigger dla posts (aktualizacja post_count)
CREATE OR REPLACE FUNCTION social_art.trigger_update_rabbit_hole_post_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.rabbit_hole_id IS NOT NULL THEN
    PERFORM social_art.update_rabbit_hole_stats(NEW.rabbit_hole_id);
  ELSIF TG_OP = 'UPDATE' AND (OLD.rabbit_hole_id != NEW.rabbit_hole_id OR OLD.is_deleted != NEW.is_deleted) THEN
    IF OLD.rabbit_hole_id IS NOT NULL THEN
      PERFORM social_art.update_rabbit_hole_stats(OLD.rabbit_hole_id);
    END IF;
    IF NEW.rabbit_hole_id IS NOT NULL THEN
      PERFORM social_art.update_rabbit_hole_stats(NEW.rabbit_hole_id);
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.rabbit_hole_id IS NOT NULL THEN
    PERFORM social_art.update_rabbit_hole_stats(OLD.rabbit_hole_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_posts_rabbit_hole_stats
  AFTER INSERT OR UPDATE OR DELETE ON social_art.posts
  FOR EACH ROW EXECUTE FUNCTION social_art.trigger_update_rabbit_hole_post_stats();

-- Dodaj właściciela jako członka z rolą 'owner' dla istniejących Rabbit Holes
INSERT INTO social_art.rabbit_hole_members (rabbit_hole_id, user_id, role, is_liked)
SELECT id, owner_id, 'owner', false
FROM social_art.rabbit_holes
WHERE NOT EXISTS (
  SELECT 1 FROM social_art.rabbit_hole_members
  WHERE rabbit_hole_id = social_art.rabbit_holes.id
);

-- Aktualizuj statystyki dla istniejących Rabbit Holes
DO $$
DECLARE
  rh_id UUID;
BEGIN
  FOR rh_id IN SELECT id FROM social_art.rabbit_holes LOOP
    PERFORM social_art.update_rabbit_hole_stats(rh_id);
  END LOOP;
END $$;
