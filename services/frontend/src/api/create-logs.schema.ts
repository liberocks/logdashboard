import { z } from "zod";

import { SeverityLevelEnum } from "@/constants/severity";
import { LogModelSchema } from "@/model";

export const CreateLogPayloadSchema = z.object({
  severity: SeverityLevelEnum,
  message: z.string().max(1024, "Message cannot exceed 1024 characters"),
  source: z.string().max(256, "Source cannot exceed 256 characters"),
});

export const CreateLogResponseSchema = LogModelSchema.extend({
  status_code: z.number(),
});

export type CreateLogPayload = z.infer<typeof CreateLogPayloadSchema>;
export type CreateLogResponse = z.infer<typeof CreateLogResponseSchema>;
