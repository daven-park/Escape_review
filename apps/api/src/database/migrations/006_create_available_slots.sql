CREATE TABLE available_slots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  theme_id TEXT NOT NULL REFERENCES themes(id),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  price INTEGER,
  UNIQUE (theme_id, date, time)
);

CREATE INDEX idx_slots_theme_date ON available_slots(theme_id, date);
