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

-- ============================================================
-- Counter Sync Triggers
-- These triggers maintain the redundant count fields automatically
-- ============================================================

-- 1. posts.like_count — sync from likes table
CREATE OR REPLACE FUNCTION sync_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'post' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'post' THEN
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_post_like_count ON likes;
CREATE TRIGGER trg_sync_post_like_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION sync_post_like_count();

-- 2. comments.like_count — sync from likes table
CREATE OR REPLACE FUNCTION sync_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'comment' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'comment' THEN
    UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_comment_like_count ON likes;
CREATE TRIGGER trg_sync_comment_like_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION sync_comment_like_count();

-- 3. posts.comment_count — sync from comments (only published)
CREATE OR REPLACE FUNCTION sync_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status != 'published' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_post_comment_count ON comments;
CREATE TRIGGER trg_sync_post_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION sync_post_comment_count();

-- 4. posts.bookmark_count — sync from bookmarks
CREATE OR REPLACE FUNCTION sync_post_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET bookmark_count = bookmark_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_post_bookmark_count ON bookmarks;
CREATE TRIGGER trg_sync_post_bookmark_count
  AFTER INSERT OR DELETE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION sync_post_bookmark_count();

-- 5. tags.post_count — sync from post_tags (only published posts)
CREATE OR REPLACE FUNCTION sync_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET post_count = post_count + 1 WHERE id = NEW.tag_id
      AND EXISTS (SELECT 1 FROM posts WHERE id = NEW.post_id AND status = 'published');
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.tag_id
      AND EXISTS (SELECT 1 FROM posts WHERE id = OLD.post_id AND status = 'published');
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_tag_post_count ON post_tags;
CREATE TRIGGER trg_sync_tag_post_count
  AFTER INSERT OR DELETE ON post_tags
  FOR EACH ROW EXECUTE FUNCTION sync_tag_post_count();

-- Keep tag counts correct when a reviewed post enters or leaves published state.
CREATE OR REPLACE FUNCTION sync_tag_post_status_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != 'published' AND NEW.status = 'published' THEN
    UPDATE tags SET post_count = post_count + 1
      WHERE id IN (SELECT tag_id FROM post_tags WHERE post_id = NEW.id);
  ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
    UPDATE tags SET post_count = GREATEST(post_count - 1, 0)
      WHERE id IN (SELECT tag_id FROM post_tags WHERE post_id = NEW.id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_tag_post_status_count ON posts;
CREATE TRIGGER trg_sync_tag_post_status_count
  AFTER UPDATE OF status ON posts
  FOR EACH ROW EXECUTE FUNCTION sync_tag_post_status_count();

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
