-- Enable necessary extensions for the Slack clone

-- pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add any other extensions here if needed in the future
-- For example, if we later decide to use vector search for AI features:
-- CREATE EXTENSION IF NOT EXISTS pgvector; 