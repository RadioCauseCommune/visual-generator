-- Migration 001: Tables pour la publication sociale (Instagram, LinkedIn)
-- Exécuter dans la console SQL Supabase

-- Extension pour le chiffrement des tokens OAuth
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table des tokens OAuth par utilisateur et plateforme
CREATE TABLE IF NOT EXISTS social_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin')),
  account_id TEXT NOT NULL,
  account_name TEXT,
  -- Le token est stocké chiffré via pgcrypto (clé dans SOCIAL_TOKEN_ENCRYPTION_KEY)
  -- En pratique, le chiffrement est géré côté serveur Express avant INSERT
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  -- Si TRUE, ce compte est le compte par défaut Radio Cause Commune (géré par admin)
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Un seul token par (user, platform, account_id)
  UNIQUE (user_id, platform, account_id)
);

-- RLS : chaque utilisateur ne voit que ses propres tokens
ALTER TABLE social_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own social tokens"
  ON social_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social tokens"
  ON social_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social tokens"
  ON social_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social tokens"
  ON social_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Les comptes par défaut (is_default=true) sont lisibles par tous les utilisateurs connectés
CREATE POLICY "All users can read default accounts"
  ON social_tokens FOR SELECT
  USING (is_default = TRUE AND auth.uid() IS NOT NULL);

-- Table de l'historique des publications
CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin')),
  account_id TEXT,
  account_name TEXT,
  caption TEXT,
  -- URL temporaire Supabase Storage (nettoyée après publication)
  image_url TEXT,
  -- ID du post retourné par Meta/LinkedIn
  platform_post_id TEXT,
  -- URL du post sur la plateforme (construite à partir du platform_post_id)
  post_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS : chaque utilisateur ne voit que ses publications
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own publications"
  ON publications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own publications"
  ON publications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own publications"
  ON publications FOR UPDATE
  USING (auth.uid() = user_id);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_publications_user_id ON publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_social_tokens_user_platform ON social_tokens(user_id, platform);
