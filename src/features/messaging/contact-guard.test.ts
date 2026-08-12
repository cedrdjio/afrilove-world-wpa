import { describe, expect, it } from "vitest";

import { looksLikeContactInfo } from "./contact-guard";

describe("looksLikeContactInfo", () => {
  it("flags phone numbers in various formats", () => {
    expect(looksLikeContactInfo("appelle moi 6 77 88 99 00")).toBe(true);
    expect(looksLikeContactInfo("+237 677889900 stp")).toBe(true);
    expect(looksLikeContactInfo("mon 06-77-88-99-00")).toBe(true);
    expect(looksLikeContactInfo("(677) 889-900 456")).toBe(true);
  });

  it("flags off-platform messaging handles", () => {
    expect(looksLikeContactInfo("on parle sur WhatsApp ?")).toBe(true);
    expect(looksLikeContactInfo("mon telegram: jean")).toBe(true);
    expect(looksLikeContactInfo("ajoute moi sur snap")).toBe(true);
    expect(looksLikeContactInfo("donne ton numéro")).toBe(true);
    expect(looksLikeContactInfo("t'as instagram ?")).toBe(true);
  });

  it("does not flag ordinary chat with small numbers", () => {
    expect(looksLikeContactInfo("j'ai 25 ans et toi ?")).toBe(false);
    expect(looksLikeContactInfo("rdv à 20h30 demain")).toBe(false);
    expect(looksLikeContactInfo("j'habite au 12 rue x, apt 5")).toBe(false);
    expect(looksLikeContactInfo("coucou tu vas bien ? belle photo")).toBe(
      false,
    );
  });
});
