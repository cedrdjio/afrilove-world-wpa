import { describe, expect, it } from "vitest";

import {
  formatClockTime,
  formatConversationTime,
  formatDistanceKm,
  initials,
  truncate,
} from "./format";

describe("initials", () => {
  it("prend les deux premières initiales en majuscules", () => {
    expect(initials("Aïcha N'Diaye")).toBe("AN");
    expect(initials("thomas")).toBe("T");
  });
});

describe("formatDistanceKm", () => {
  it("gère la proximité et l'arrondi", () => {
    expect(formatDistanceKm(0.4)).toBe("à moins d'1 km");
    expect(formatDistanceKm(8.3)).toBe("à 8 km");
  });
});

describe("truncate", () => {
  it("n'altère pas un texte court et ajoute une ellipse au-delà", () => {
    expect(truncate("court", 10)).toBe("court");
    expect(truncate("bonjour tout le monde", 8)).toBe("bonjour…");
  });
});

describe("formatConversationTime", () => {
  const now = new Date("2026-08-03T15:00:00Z");

  it("affiche l'heure le jour même", () => {
    expect(formatConversationTime("2026-08-03T14:32:00Z", now)).toMatch(
      /\d{2}:\d{2}/,
    );
  });

  it("affiche « Hier » la veille", () => {
    expect(formatConversationTime("2026-08-02T09:00:00Z", now)).toBe("Hier");
  });

  it("affiche un jour de semaine dans les 7 jours", () => {
    const label = formatConversationTime("2026-07-30T09:00:00Z", now);
    expect(label.length).toBeGreaterThan(0);
    expect(label).not.toBe("Hier");
  });
});

describe("formatClockTime", () => {
  it("renvoie une heure HH:MM", () => {
    expect(formatClockTime("2026-08-03T14:20:00Z")).toMatch(/\d{2}:\d{2}/);
  });
});
