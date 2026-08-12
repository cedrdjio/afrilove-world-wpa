-- Free-tier messaging gates, enforced in the database so a client holding a
-- valid JWT cannot bypass them (the app also blocks in the UI; this is the
-- non-circumventable backstop).
--
-- 1. Free accounts: at most 5 messages SENT per conversation (per match).
--    Premium accounts are unlimited. Mirrors the client's per-conversation
--    counter (chat-container.tsx).
-- 2. Free accounts may not share contact details (phone numbers or off-platform
--    messaging handles) — that is how members leave before paying. Strict rule:
--    a run of 7+ digits (tolerating spaces / dots / dashes / parens / +) OR an
--    explicit handle keyword. Premium accounts are exempt.

create or replace function public.enforce_free_message_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_premium boolean;
  v_count int;
begin
  v_premium := public.has_active_premium(new.sender_id);
  if v_premium then
    return new;
  end if;

  -- Partage de coordonnées interdit en gratuit : numéro (7+ chiffres, séparateurs
  -- tolérés) ou pseudo de messagerie tierce.
  if regexp_replace(new.content, '[\s().+/-]', '', 'g') ~ '\d{7,}'
     or new.content ~* '(whats\s*app|watsapp|\mwsp\M|telegram|t\.me|snap\s*chat|\msnap\M|viber|\msignal\M|insta\s*gram|num[eé]ro)'
  then
    raise exception 'CONTACT_SHARING_PREMIUM_ONLY';
  end if;

  -- 5 messages gratuits par conversation.
  select count(*) into v_count
    from public.messages
    where match_id = new.match_id and sender_id = new.sender_id;
  if v_count >= 5 then
    raise exception 'FREE_MESSAGE_LIMIT_REACHED';
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_free_message_limits() from public, anon, authenticated;

drop trigger if exists before_message_free_limits on public.messages;
create trigger before_message_free_limits
  before insert on public.messages
  for each row execute function public.enforce_free_message_limits();
