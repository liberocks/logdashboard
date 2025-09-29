import { z } from "zod";

import { SeverityLevelEnum } from "@/constants/severity";
import { LogModelSchema } from "@/model";

export const UpdateLogPayloadSchema = z.object({
  severity: SeverityLevelEnum,
  message: z.string().max(1024, "Message cannot exceed 1024 characters"),
  source: z.string().max(256, "Source cannot exceed 256 characters"),
});

export const UpdateLogResponseSchema = LogModelSchema.extend({
  status_code: z.number(),
});

export type UpdateLogPayload = z.infer<typeof UpdateLogPayloadSchema>;
export type UpdateLogResponse = z.infer<typeof UpdateLogResponseSchema>;
