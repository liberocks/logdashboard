import { z } from "zod";

import { SeverityLevelEnum } from "@/constants/severity";

export const LogModelSchema = z.object({
  id: z.string(),
  severity: SeverityLevelEnum,
  message: z.string(),
  source: z.string(),
  timestamp: z.iso.datetime(),
});

export type LogModel = z.infer<typeof LogModelSchema>;
