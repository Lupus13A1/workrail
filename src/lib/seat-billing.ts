export const FREE_HUMAN_SEATS = 2;

export function getBillableHumanSeats(activeHumanSeats: number): number {
  return Math.max(0, activeHumanSeats - FREE_HUMAN_SEATS);
}

export function getBillableSeatDays(activeHumanSeatDays: number[]): number {
  const dailyTotals = activeHumanSeatDays.map((days) => Math.max(0, days)).sort((a, b) => b - a);
  return dailyTotals.slice(FREE_HUMAN_SEATS).reduce((total, days) => total + days, 0);
}

export function getBillableAgentSeats(_connectedAgents: number): number {
  return 0;
}