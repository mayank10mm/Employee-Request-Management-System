import { Priority } from "@prisma/client";

type SlaHours = {
  firstResponseHours: number;
  resolutionHours: number;
};

const SLA_BY_PRIORITY: Record<Priority, SlaHours> = {
  LOW: { firstResponseHours: 8, resolutionHours: 48 },
  MEDIUM: { firstResponseHours: 4, resolutionHours: 24 },
  HIGH: { firstResponseHours: 1, resolutionHours: 8 },
  CRITICAL: { firstResponseHours: 0.5, resolutionHours: 4 },
};

export function slaWindows(priority: Priority): SlaHours {
  return SLA_BY_PRIORITY[priority];
}

export function slaDeadlines(priority: Priority, from = new Date()) {
  const { firstResponseHours, resolutionHours } = slaWindows(priority);
  return {
    slaFirstResponseAt: addHours(from, firstResponseHours),
    slaDeadline: addHours(from, resolutionHours),
  };
}

export function remainingMs(deadline: Date, now = new Date()) {
  return deadline.getTime() - now.getTime();
}

function addHours(from: Date, hours: number) {
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}
