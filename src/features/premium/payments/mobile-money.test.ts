import { describe, expect, it } from "vitest";

import {
  detectOperator,
  formatCmPhone,
  isValidCmMomo,
  normalizeCmPhone,
} from "./mobile-money";

describe("normalizeCmPhone", () => {
  it("retire les préfixes internationaux", () => {
    expect(normalizeCmPhone("+237 650 12 34 56")).toBe("650123456");
    expect(normalizeCmPhone("00237699887766")).toBe("699887766");
    expect(normalizeCmPhone("237 671234567")).toBe("671234567");
  });
});

describe("detectOperator", () => {
  it("reconnaît MTN (650-654, 67x, 68x)", () => {
    expect(detectOperator("650123456")?.operator).toBe("mtn");
    expect(detectOperator("678123456")?.paymentMethod).toBe("mtn_momo");
  });

  it("reconnaît Orange (655-659, 69x)", () => {
    expect(detectOperator("655123456")?.operator).toBe("orange");
    expect(detectOperator("699123456")?.paymentMethod).toBe("orange_money");
  });

  it("rejette un numéro invalide", () => {
    expect(detectOperator("612345678")).toBeNull();
    expect(isValidCmMomo("12345")).toBe(false);
  });
});

describe("formatCmPhone", () => {
  it("groupe en 6 XX XX XX XX", () => {
    expect(formatCmPhone("650123456")).toBe("6 50 12 34 56");
  });
});
