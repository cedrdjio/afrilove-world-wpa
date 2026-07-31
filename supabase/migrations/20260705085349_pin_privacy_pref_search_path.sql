-- Linter 0011 : épingle le search_path de la seule fonction qui ne l'avait
-- pas fixé. Fonction SQL pure (opérations jsonb), aucun objet référencé.
alter function public.privacy_pref(jsonb, text) set search_path = '';;
