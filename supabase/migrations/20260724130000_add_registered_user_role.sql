-- ============================================================================
-- Add 'registered_user' to public.user_role
--
-- Isolated in its own migration/transaction: Postgres forbids using a
-- freshly-added enum value in the same transaction that added it, so
-- anything that references 'registered_user' (default, functions) lives in
-- the next migration file.
-- ============================================================================

alter type public.user_role add value if not exists 'registered_user';
