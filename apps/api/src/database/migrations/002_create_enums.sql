CREATE TYPE auth_provider AS ENUM ('GOOGLE', 'LOCAL');

CREATE TYPE genre AS ENUM (
  'HORROR',
  'THRILLER',
  'SF',
  'FANTASY',
  'MYSTERY',
  'ROMANCE',
  'ADVENTURE',
  'OTHER'
);

CREATE TYPE difficulty_label AS ENUM ('EASY', 'NORMAL', 'HARD', 'VERY_HARD');
