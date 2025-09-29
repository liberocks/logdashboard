import { ofetch } from "ofetch";
import { z } from "zod";

import { SeverityLevel } from "@/constants/severity";
import { CreateLogPayload, CreateLogPayloadSchema, CreateLogResponse, CreateLogResponseSchema } from "./create-logs.schema";
import { API_BASE_URL } from "@/constants";

export async function createLog(payload: CreateLogPayload): Promise<CreateLogResponse> {
  const validatedPayload = CreateLogPayloadSchema.parse(payload);

  try {
    const response = await ofetch(`${API_BASE_URL}/api/v1/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: validatedPayload,
    });

    const validatedResponse = CreateLogResponseSchema.parse(response);
    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }

    throw error;
  }
}

export async function createLogEntry(severity: SeverityLevel, message: string, source: string): Promise<CreateLogResponse> {
  const payload: CreateLogPayload = {
    severity,
    message,
    source,
  };

  return createLog(payload);
}
