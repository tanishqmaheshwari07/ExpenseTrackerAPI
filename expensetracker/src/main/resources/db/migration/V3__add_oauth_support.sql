-- =============================================================================
-- Migration V3: Add Google OAuth Support (auth_provider, provider_id, nullable password)
-- =============================================================================

-- 1. Add auth_provider column with default 'LOCAL' for existing users
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

-- 2. Add provider_id column (e.g. Google subject ID)
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(100);

-- 3. Make password column nullable for OAuth users who do not use a local password
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 4. Create composite index for provider identity lookup (auth_provider, provider_id)
CREATE INDEX IF NOT EXISTS idx_users_auth_provider_provider_id ON users(auth_provider, provider_id);
