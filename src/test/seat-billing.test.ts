import { describe, expect, it } from "vitest";

import { getBillableAgentSeats, getBillableHumanSeats, getBillableSeatDays } from "@/lib/seat-billing";

describe("seat-day pricing", () => {
  it("keeps the first two human seats free", () => {
    expect(getBillableHumanSeats(2)).toBe(0);
  });

  it("counts only human seats beyond the two free seats", () => {
    expect(getBillableHumanSeats(5)).toBe(3);
  });

  it("does not charge connected AI agents for seats", () => {
    expect(getBillableAgentSeats(4)).toBe(0);
  });

  it("calculates only active seat-days beyond the two free seats", () => {
    expect(getBillableSeatDays([31, 31, 12])).toBe(12);
  });

  it("does not charge seat-days when only the two free seats are active", () => {
    expect(getBillableSeatDays([31, 12])).toBe(0);
  });
});