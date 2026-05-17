ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS photos_published_idx
  ON photos (created_at DESC, id DESC)
  WHERE archived_at IS NULL;
