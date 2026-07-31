-- La recréation des RPC de découverte (migration diaspora, `create function`
-- sans revoke) a restauré le grant EXECUTE par défaut accordé à PUBLIC/anon.
-- Ces fonctions filtrent déjà par auth.uid() (vide hors session), mais on
-- referme l'accès anon par principe, comme le fait 20260706160506.
revoke execute on function public.search_profiles(integer, integer, integer, boolean, boolean, boolean, integer, integer, text, uuid[], text, text) from public, anon;
grant execute on function public.search_profiles(integer, integer, integer, boolean, boolean, boolean, integer, integer, text, uuid[], text, text) to authenticated;

revoke execute on function public.count_search_profiles(integer, integer, integer, boolean, uuid[], text, text) from public, anon;
grant execute on function public.count_search_profiles(integer, integer, integer, boolean, uuid[], text, text) to authenticated;

revoke execute on function public.get_discovery_countries() from public, anon;
grant execute on function public.get_discovery_countries() to authenticated;

-- Fonction trigger : ne doit jamais être appelable directement via RPC.
revoke execute on function public.audit_admin_credential_change() from public, anon, authenticated;
