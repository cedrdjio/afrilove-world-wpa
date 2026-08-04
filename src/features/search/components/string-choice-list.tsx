"use client";

import { ChoiceList } from "@/features/profile/components/choice-list";

/**
 * Liste de choix unique sur des libellés bruts — adaptateur autour de
 * `ChoiceList` (qui attend `{ id, label }[]`). Port de l'usage
 * `ChoiceListEditor` dans les écrans de filtre mobiles où la valeur EST le
 * libellé (pays, ville, religion, éducation).
 */
export function StringChoiceList({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <ChoiceList
      options={options.map((label) => ({ id: label, label }))}
      selectedId={value}
      onSelect={onChange}
    />
  );
}
