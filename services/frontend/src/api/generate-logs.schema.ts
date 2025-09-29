import { z } from "zod";

export const GenerateLogsPayloadSchema = z.object({
  count: z.number().int().min(10).max(1000),
  days_back: z.number().int().min(0).max(365),
});

export const GenerateLogsResponseSchema = z.object({
  count: z.number(),
  status_code: z.number(),
});

export type GenerateLogsPayload = z.infer<typeof GenerateLogsPayloadSchema>;
export type GenerateLogsResponse = z.infer<typeof GenerateLogsResponseSchema>;
