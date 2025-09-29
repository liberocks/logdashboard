import { ofetch } from "ofetch";
import { z } from "zod";

import { SeverityLevel } from "@/constants/severity";
import { UpdateLogPayload, UpdateLogPayloadSchema, UpdateLogResponse, UpdateLogResponseSchema } from "./update-log.schema";
import { API_BASE_URL } from "@/constants";

export async function updateLog(logId: string, payload: UpdateLogPayload): Promise<UpdateLogResponse> {
  const validatedPayload = UpdateLogPayloadSchema.parse(payload);

  try {
    const response = await ofetch(`${API_BASE_URL}/logs/${logId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: validatedPayload,
    });

    const validatedResponse = UpdateLogResponseSchema.parse(response);
    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }

    throw error;
  }
}

export async function updateLogEntry(logId: string, severity: SeverityLevel, message: string, source: string): Promise<UpdateLogResponse> {
  const payload: UpdateLogPayload = {
    severity,
    message,
    source,
  };

  return updateLog(logId, payload);
}
