import { z } from "zod";

import { SeverityLevelEnum } from "@/constants/severity";

export const GetAggregatedLogsParameterSchema = z.object({
  severity: SeverityLevelEnum.optional(),
  source: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export const GetAggregatedLogsResponseSchema = z.object({
  status_code: z.number(),
  severity_counts: z.record(SeverityLevelEnum, z.number()),
  source_counts: z.record(z.string(), z.number()),
  total_logs: z.number(),
});

export type GetAggregatedLogsParameter = z.infer<typeof GetAggregatedLogsParameterSchema>;
export type GetAggregatedLogsResponse = z.infer<typeof GetAggregatedLogsResponseSchema>;
