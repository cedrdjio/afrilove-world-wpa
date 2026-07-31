-- CamerPay integration — real payments (mobile money + cards, XAF).
-- Provider-agnostic: the webhook calls the shared grant_subscription() core.

-- 1. Allow 'camerpay' as a subscription provider.
alter table public.subscriptions drop constraint subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('dev', 'moneroo', 'stripe', 'google', 'apple', 'admin', 'camerpay'));

-- 2. Payment attempts — one row per checkout, source of truth for the webhook.
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan_key text not null references public.premium_plans (key),
  provider text not null default 'camerpay',
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'canceled')),
  invoice_id text not null unique,
  provider_uuid text unique,
  provider_tx_id text,
  amount int not null check (amount >= 0),
  currency text not null default 'XAF',
  amount_source_cents int,
  subscription_id uuid references public.subscriptions (id),
  payment_method text,
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_transactions_profile_idx
  on public.payment_transactions (profile_id, created_at desc);

alter table public.payment_transactions enable row level security;

create policy "Members read their own payments"
  on public.payment_transactions for select to authenticated
  using (auth.uid() = profile_id);

grant select, insert, update on public.payment_transactions to service_role;

-- 3. Settlement — idempotent, provider-agnostic, called by the webhook only.
create or replace function public.settle_camerpay_payment(
  p_provider_uuid text,
  p_amount int,
  p_provider_tx_id text default null,
  p_payment_method text default null,
  p_paid_at timestamptz default null,
  p_raw jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payment_transactions;
  v_sub_id uuid;
begin
  select * into v_payment
    from public.payment_transactions
    where provider_uuid = p_provider_uuid
    for update;
  if not found then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  if v_payment.status = 'completed' then
    return v_payment.subscription_id;
  end if;

  if v_payment.amount <> p_amount then
    raise exception 'AMOUNT_MISMATCH';
  end if;

  v_sub_id := public.grant_subscription(
    v_payment.profile_id, v_payment.plan_key, 'camerpay', p_provider_uuid
  );

  update public.payment_transactions
    set status = 'completed',
        subscription_id = v_sub_id,
        provider_tx_id = coalesce(p_provider_tx_id, provider_tx_id),
        payment_method = coalesce(p_payment_method, payment_method),
        paid_at = coalesce(p_paid_at, now()),
        raw = coalesce(p_raw, raw),
        updated_at = now()
    where id = v_payment.id;

  return v_sub_id;
end;
$$;

revoke execute on function
  public.settle_camerpay_payment(text, int, text, text, timestamptz, jsonb)
  from public, anon, authenticated;
grant execute on function
  public.settle_camerpay_payment(text, int, text, text, timestamptz, jsonb)
  to service_role;

-- 4. Non-success closure — mark a payment failed/canceled (webhook only).
create or replace function public.fail_camerpay_payment(
  p_provider_uuid text,
  p_status text,
  p_raw jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('failed', 'canceled') then
    raise exception 'INVALID_STATUS';
  end if;
  update public.payment_transactions
    set status = p_status,
        raw = coalesce(p_raw, raw),
        updated_at = now()
    where provider_uuid = p_provider_uuid
      and status = 'pending';
end;
$$;

revoke execute on function public.fail_camerpay_payment(text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.fail_camerpay_payment(text, text, jsonb)
  to service_role;;
