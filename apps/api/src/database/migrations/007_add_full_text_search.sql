ALTER TABLE themes
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
) STORED;

CREATE INDEX idx_themes_search ON themes USING GIN(search_vector);

ALTER TABLE stores
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (to_tsvector('simple', name)) STORED;

CREATE INDEX idx_stores_search ON stores USING GIN(search_vector);
