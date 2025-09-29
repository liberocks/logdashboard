import { z } from "zod";

import { SeverityLevelEnum } from "@/constants/severity";
import { LogModelSchema } from "@/model";

export const GetLogsParameterSchema = z.object({
  severity: SeverityLevelEnum.optional(),
  source: z.string().optional(),
  start_date: z.iso.datetime().optional(),
  end_date: z.iso.datetime().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  offset: z.number().int().min(0).default(0),
});

export const GetLogsResponseSchema = z.object({
  status_code: z.number(),
  logs: z.array(LogModelSchema),
});

export type GetLogsParameter = z.infer<typeof GetLogsParameterSchema>;
export type GetLogsResponse = z.infer<typeof GetLogsResponseSchema>;
