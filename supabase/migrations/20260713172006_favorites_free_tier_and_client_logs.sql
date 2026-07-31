-- 1) Favoris (signets) accessibles aussi sans Premium, avec une limite de 10 ;
--    illimités en Premium. L'ancienne version exigeait Premium pour tout ajout.
create or replace function public.add_favorite(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_target_id = auth.uid() then
    raise exception 'CANNOT_FAVORITE_SELF';
  end if;
  if not public.has_active_premium(auth.uid())
     and (select count(*) from public.profile_favorites where profile_id = auth.uid()) >= 10 then
    raise exception 'FAVORITES_LIMIT_REACHED';
  end if;
  insert into public.profile_favorites (profile_id, target_id)
  values (auth.uid(), p_target_id)
  on conflict do nothing;
end;
$$;

-- 2) Journal applicatif : l'app y consigne crashs, étapes de paiement et
--    erreurs marquantes. Insertion par l'utilisateur authentifié uniquement
--    (sa propre ligne) ; lecture réservée aux admins via get_client_logs.
create table if not exists public.client_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  level text not null default 'info' check (level in ('info', 'warn', 'error')),
  event text not null,
  message text,
  context jsonb,
  created_at timestamptz not null default now()
);

create index if not exists client_logs_created_at_idx on public.client_logs (created_at desc);
create index if not exists client_logs_level_idx on public.client_logs (level, created_at desc);

alter table public.client_logs enable row level security;

drop policy if exists client_logs_insert_own on public.client_logs;
create policy client_logs_insert_own on public.client_logs
  for insert to authenticated
  with check (profile_id = auth.uid());

-- Pas de policy SELECT : la lecture passe exclusivement par le RPC admin.
create or replace function public.get_client_logs(p_limit integer default 100, p_level text default null)
returns setof public.client_logs
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_ONLY';
  end if;
  return query
    select * from public.client_logs
    where p_level is null or level = p_level
    order by created_at desc
    limit least(coalesce(p_limit, 100), 300);
end;
$$;

revoke all on function public.get_client_logs(integer, text) from public;
revoke all on function public.get_client_logs(integer, text) from anon;
grant execute on function public.get_client_logs(integer, text) to authenticated;;
