import { z } from "zod";

export const SeverityLevelEnum = z.enum(["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]);
export type SeverityLevel = z.infer<typeof SeverityLevelEnum>;
export const SEVERITY_LEVELS = {
  DEBUG: "DEBUG" as const,
  INFO: "INFO" as const,
  WARN: "WARN" as const,
  ERROR: "ERROR" as const,
  FATAL: "FATAL" as const,
} satisfies Record<string, SeverityLevel>;
