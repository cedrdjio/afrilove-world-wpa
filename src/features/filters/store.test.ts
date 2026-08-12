import { beforeEach, describe, expect, it } from "vitest";

import { useFiltersStore } from "./store";

describe("useFiltersStore", () => {
  beforeEach(() => useFiltersStore.getState().reset());

  it("bascule un centre d'intérêt (ajout/retrait)", () => {
    const store = useFiltersStore.getState();
    expect(store.interests).toContain("Voyages");
    store.toggleInterest("Voyages");
    expect(useFiltersStore.getState().interests).not.toContain("Voyages");
    useFiltersStore.getState().toggleInterest("Sport");
    expect(useFiltersStore.getState().interests).toContain("Sport");
  });

  it("met à jour la distance et la tranche d'âge", () => {
    useFiltersStore.getState().setDistance(42);
    useFiltersStore.getState().setAge(21, 30);
    const s = useFiltersStore.getState();
    expect(s.distanceKm).toBe(42);
    expect(s.ageMin).toBe(21);
    expect(s.ageMax).toBe(30);
  });

  it("réinitialise aux valeurs par défaut", () => {
    useFiltersStore.getState().setDistance(1);
    useFiltersStore.getState().reset();
    expect(useFiltersStore.getState().distanceKm).toBe(25);
  });
});
