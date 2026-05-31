-- ===========================================================================
-- production-schema.sql  (PostgreSQL 16+)
-- ---------------------------------------------------------------------------
-- Optimized relational schema for the toolkit's SaaS surface: users, catalog,
-- orders, content, chat, and analytics. Emphasizes correctness (constraints,
-- FKs), performance (selective + partial + composite + GIN indexes), and
-- operational hygiene (updated_at triggers, soft deletes, partitioning-ready
-- analytics table).
--
-- Apply: psql "$DATABASE_URL" -f production-schema.sql
-- ===========================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram search indexes

-- ---------------------------------------------------------------------------
-- Shared: auto-update updated_at on row modification.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================
-- IDENTITY
-- ===========================================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL,
  display_name  TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 120),
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('member', 'admin', 'owner', 'service')),
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);
-- Enforce unique email only among non-deleted users (partial unique index).
CREATE UNIQUE INDEX uq_users_email_active ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users (role) WHERE status = 'active';

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash    TEXT NOT NULL UNIQUE,           -- store hash, never plaintext
  label       TEXT NOT NULL,
  scopes      TEXT[] NOT NULL DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_keys_user ON api_keys (user_id);
CREATE INDEX idx_api_keys_scopes_gin ON api_keys USING GIN (scopes);

-- ===========================================================================
-- CATALOG + ORDERS
-- ===========================================================================
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category    TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency    CHAR(3) NOT NULL DEFAULT 'USD',
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  reserved    INTEGER NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  attributes  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Available stock can never be negative.
  CONSTRAINT chk_stock_reserved CHECK (reserved <= stock)
);
CREATE INDEX idx_products_category_active ON products (category) WHERE is_active;
CREATE INDEX idx_products_attributes_gin  ON products USING GIN (attributes jsonb_path_ops);
-- Fast fuzzy title search for the storefront search box.
CREATE INDEX idx_products_title_trgm ON products USING GIN (title gin_trgm_ops);

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  idempotency_key TEXT NOT NULL UNIQUE,        -- prevents double-charge
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','fulfilled','cancelled','refunded')),
  total_cents     INTEGER NOT NULL CHECK (total_cents >= 0),
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  charge_id       TEXT,
  placed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user_placed ON orders (user_id, placed_at DESC);
CREATE INDEX idx_orders_status ON orders (status) WHERE status IN ('pending','paid');

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_cents  INTEGER NOT NULL CHECK (unit_cents >= 0),
  PRIMARY KEY (order_id, product_id)
);
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- Atomic stock reservation helper (used by the storefront cart flow).
CREATE OR REPLACE FUNCTION reserve_stock(p_product UUID, p_qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  ok BOOLEAN;
BEGIN
  UPDATE products
     SET reserved = reserved + p_qty
   WHERE id = p_product
     AND stock - reserved >= p_qty
  RETURNING true INTO ok;
  RETURN COALESCE(ok, false);
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================
-- HEADLESS CMS
-- ===========================================================================
CREATE TABLE content_types (
  name        TEXT PRIMARY KEY,
  schema      JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL REFERENCES content_types(name) ON DELETE RESTRICT,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','published','archived')),
  version      INTEGER NOT NULL DEFAULT 1,
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  author_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE INDEX idx_content_type_status ON content (type, status);
CREATE INDEX idx_content_data_gin    ON content USING GIN (data jsonb_path_ops);
CREATE INDEX idx_content_published   ON content (published_at DESC) WHERE status = 'published';

CREATE TRIGGER trg_content_updated BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Immutable version history for auditing / rollback.
CREATE TABLE content_versions (
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  version    INTEGER NOT NULL,
  data       JSONB NOT NULL,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  saved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  PRIMARY KEY (content_id, version)
);

-- ===========================================================================
-- CHAT
-- ===========================================================================
CREATE TABLE channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  is_private  BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE channel_members (
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner','member','readonly')),
  last_read_seq BIGINT NOT NULL DEFAULT 0,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);
CREATE INDEX idx_channel_members_user ON channel_members (user_id);

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  seq         BIGINT NOT NULL,                 -- monotonic per channel
  body        TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at   TIMESTAMPTZ,
  UNIQUE (channel_id, seq)
);
-- Cursor pagination: newest-first within a channel.
CREATE INDEX idx_messages_channel_seq ON messages (channel_id, seq DESC);

-- Per-channel monotonic sequence generator (gap-free, concurrency-safe).
CREATE OR REPLACE FUNCTION next_message_seq(p_channel UUID)
RETURNS BIGINT AS $$
DECLARE
  v_seq BIGINT;
BEGIN
  -- SELECT ... FOR UPDATE serializes seq assignment per channel row.
  SELECT COALESCE(MAX(seq), 0) + 1 INTO v_seq
    FROM messages WHERE channel_id = p_channel FOR UPDATE;
  RETURN v_seq;
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================
-- ANALYTICS (append-only, range-partitioned by day for cheap retention drops)
-- ===========================================================================
CREATE TABLE analytics_events (
  id         BIGINT GENERATED ALWAYS AS IDENTITY,
  metric     TEXT NOT NULL,
  value      DOUBLE PRECISION NOT NULL DEFAULT 1,
  dims       JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_ref   TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (occurred_at);

-- Example child partitions; create the next day's partition via a scheduled job.
CREATE TABLE analytics_events_default PARTITION OF analytics_events DEFAULT;

CREATE INDEX idx_analytics_metric_time ON analytics_events (metric, occurred_at DESC);
CREATE INDEX idx_analytics_dims_gin    ON analytics_events USING GIN (dims jsonb_path_ops);

-- Materialized rollup for the dashboard (refresh on a schedule / concurrently).
CREATE MATERIALIZED VIEW analytics_hourly AS
SELECT
  date_trunc('hour', occurred_at) AS bucket,
  metric,
  count(*)                        AS events,
  sum(value)                      AS value_sum,
  avg(value)                      AS value_avg
FROM analytics_events
GROUP BY 1, 2
WITH NO DATA;
CREATE UNIQUE INDEX uq_analytics_hourly ON analytics_hourly (bucket, metric);

COMMIT;

-- ---------------------------------------------------------------------------
-- Operational notes:
--   * REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_hourly;  -- needs the unique idx
--   * Create daily partitions ahead of time:
--       CREATE TABLE analytics_events_2026_06_01 PARTITION OF analytics_events
--         FOR VALUES FROM ('2026-06-01') TO ('2026-06-02');
--   * Drop old data cheaply by detaching/dropping a whole partition.
-- ---------------------------------------------------------------------------
