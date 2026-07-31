-- Perf : après l'ajout de ~100 profils de démo, le coût estimé de la requête
-- de découverte a franchi le seuil jit_above_cost de Postgres. Résultat : le
-- planner recompilait (JIT) search_profiles à CHAQUE appel, ajoutant ~400 ms
-- de latence au chargement de l'écran Découvrir (mesuré : 466 ms JIT on vs
-- 55 ms JIT off). Le JIT n'apporte rien sur ces petites requêtes OLTP répétées ;
-- on le désactive au niveau des deux fonctions concernées. Réversible.
alter function public.search_profiles(integer,integer,integer,boolean,boolean,boolean,integer,integer,text,uuid[])
  set jit = off;
alter function public.count_search_profiles(integer,integer,integer,boolean,uuid[])
  set jit = off;;
