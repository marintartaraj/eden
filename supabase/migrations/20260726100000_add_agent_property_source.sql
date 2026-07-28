-- ============================================================================
-- Add 'agent' to public.property_source
--
-- Isolated in its own migration/transaction: Postgres forbids using a
-- freshly-added enum value in the same transaction that added it.
-- ============================================================================

alter type public.property_source add value if not exists 'agent';
