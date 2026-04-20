-- Stripe subscribers table
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  status text not null default 'inactive',
  plan text,
  cancel_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by stripe_customer_id (used in webhook handlers)
create index if not exists subscribers_stripe_customer_id_idx on subscribers(stripe_customer_id);

-- Ensure newsletter_subscribers already exists (created by prior setup)
-- This migration only adds the new subscribers table for paid memberships.
