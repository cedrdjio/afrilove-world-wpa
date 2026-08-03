import { beforeEach, describe, expect, it } from "vitest";

import { useDiscoveryStore } from "./store";

const reset = () => useDiscoveryStore.getState().reset();

describe("useDiscoveryStore", () => {
  beforeEach(reset);

  it("dépile le profil du dessus à chaque swipe", () => {
    const before = useDiscoveryStore.getState().queue.length;
    useDiscoveryStore.getState().swipe("pass");
    expect(useDiscoveryStore.getState().queue.length).toBe(before - 1);
    expect(useDiscoveryStore.getState().history[0]?.direction).toBe("pass");
  });

  it("déclenche un match sur un like réciproque (Mariama)", () => {
    // Thomas d'abord (non réciproque), puis Mariama (réciproque).
    useDiscoveryStore.getState().swipe("pass");
    expect(useDiscoveryStore.getState().matched).toBeNull();
    useDiscoveryStore.getState().swipe("like");
    expect(useDiscoveryStore.getState().matched?.id).toBe("mariama");
  });

  it("ne matche jamais sur un pass", () => {
    useDiscoveryStore.getState().swipe("pass"); // thomas
    useDiscoveryStore.getState().swipe("pass"); // mariama
    expect(useDiscoveryStore.getState().matched).toBeNull();
  });

  it("rewind restaure le dernier profil", () => {
    const top = useDiscoveryStore.getState().queue[0];
    useDiscoveryStore.getState().swipe("pass");
    useDiscoveryStore.getState().rewind();
    expect(useDiscoveryStore.getState().queue[0]?.id).toBe(top?.id);
    expect(useDiscoveryStore.getState().history).toHaveLength(0);
  });
});
