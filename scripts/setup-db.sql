-- ============================================================
-- bingbingbingo — Post-schema database setup
-- PostgreSQL 16
-- ============================================================

-- Extensions are idempotent; init-db.sql normally creates these first.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pg_bigm";
EXCEPTION WHEN undefined_file THEN
  RAISE NOTICE 'pg_bigm is unavailable locally; search will use tsvector/ILIKE fallback';
END $$;

-- Counter Sync Triggers: REMOVED
-- Counter management is now done in application services,
-- which are the single source of truth for counters.
-- ============================================================

-- ============================================================
-- Full-Text Search: tsvector column + GIN index + trigger
-- ============================================================

-- Add tsvector column to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tsv_content tsvector;

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_posts_tsv_content ON posts USING GIN (tsv_content);

-- Trigger to auto-update tsvector
CREATE OR REPLACE FUNCTION posts_tsv_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tsv_content := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content_md, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_tsv ON posts;
CREATE TRIGGER trg_posts_tsv
  BEFORE INSERT OR UPDATE OF title, content_md ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_tsv_update();

-- ============================================================
-- Seed: Official Tags
-- ============================================================

INSERT INTO tags (id, name, slug, description, is_official) VALUES
  (gen_random_uuid(), 'Vibe Coding', 'vibe-coding', 'AI 辅助编程、vibe coding 相关讨论', true),
  (gen_random_uuid(), 'AI工具', 'ai-tools', 'Cursor、Claude Code、Copilot 等 AI 编程工具', true),
  (gen_random_uuid(), '作品展示', 'showcase', '展示你的 vibe coding 作品', true),
  (gen_random_uuid(), '技术讨论', 'tech-discussion', '技术问题讨论与交流', true),
  (gen_random_uuid(), '求助', 'help', '遇到问题？来这里求助', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Seed: Admin User (password: admin123)
-- ============================================================

INSERT INTO users (id, username, email, password_hash, role, status) VALUES
  (gen_random_uuid(), 'admin', 'admin@bingbingbingo.cn',
   '$2a$10$hhaZiEtI27shkYStR/1fzONisMhGI7l0b5vkGhv3dFHbr3murImmm', -- bcrypt hash of 'admin123'
   'admin', 'active')
ON CONFLICT (email) DO NOTHING;
