import { z } from "zod";

import { SeverityLevelEnum } from "@/constants/severity";

export const GetAggregatedLogsResponseSchema = z.object({
  status_code: z.number(),
  severity_counts: z.record(SeverityLevelEnum, z.number()),
  source_counts: z.record(z.string(), z.number()),
  total_logs: z.number(),
});

export type GetAggregatedLogsResponse = z.infer<typeof GetAggregatedLogsResponseSchema>;
