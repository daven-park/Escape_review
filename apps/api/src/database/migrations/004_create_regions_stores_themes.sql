CREATE TABLE regions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_regions_city ON regions(city);

CREATE TABLE stores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  region_id TEXT NOT NULL REFERENCES regions(id),
  address TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_region_id ON stores(region_id);
CREATE INDEX idx_stores_name ON stores(name);

CREATE TABLE themes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  store_id TEXT NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  genre genre NOT NULL,
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  player_min SMALLINT NOT NULL,
  player_max SMALLINT NOT NULL,
  duration SMALLINT NOT NULL,
  booking_url TEXT,
  poster_url TEXT,
  fear_level SMALLINT NOT NULL DEFAULT 0 CHECK (fear_level BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_themes_store_id ON themes(store_id);
CREATE INDEX idx_themes_genre ON themes(genre);
CREATE INDEX idx_themes_difficulty ON themes(difficulty);
