import { z } from "zod";

import { LogModelSchema } from "@/model";

export const GetLogResponseSchema = LogModelSchema;

export type GetLogResponse = z.infer<typeof GetLogResponseSchema>;
