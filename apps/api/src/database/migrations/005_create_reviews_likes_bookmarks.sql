CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  theme_id TEXT NOT NULL REFERENCES themes(id),
  rating NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  content TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  difficulty difficulty_label NOT NULL,
  played_at DATE NOT NULL,
  spoiler_warning BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_theme_created ON reviews(theme_id, created_at DESC);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

CREATE TABLE likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  review_id TEXT NOT NULL REFERENCES reviews(id),
  UNIQUE (user_id, review_id)
);

CREATE INDEX idx_likes_review_id ON likes(review_id);

CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  theme_id TEXT NOT NULL REFERENCES themes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, theme_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
