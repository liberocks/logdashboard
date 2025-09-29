import { ofetch } from "ofetch";
import { z } from "zod";

import { API_BASE_URL } from "@/constants";

import { UpdateLogPayload, UpdateLogPayloadSchema, UpdateLogResponse, UpdateLogResponseSchema } from "./update-log.schema";

export async function updateLog(logId: string, payload: UpdateLogPayload): Promise<UpdateLogResponse> {
  const validatedPayload = UpdateLogPayloadSchema.parse(payload);

  try {
    const response = await ofetch(`${API_BASE_URL}/api/v1/logs/${logId}`, {
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
