import { ofetch } from "ofetch";
import { z } from "zod";

import { API_BASE_URL } from "@/constants";
import { GenerateLogsPayload, GenerateLogsPayloadSchema, GenerateLogsResponse, GenerateLogsResponseSchema } from "./generate-logs.schema";

export async function generateLogs(payload: GenerateLogsPayload): Promise<GenerateLogsResponse> {
  const validatedPayload = GenerateLogsPayloadSchema.parse(payload);

  try {
    const response = await ofetch(`${API_BASE_URL}/api/v1/logs/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: validatedPayload,
    });

    const validatedResponse = GenerateLogsResponseSchema.parse(response);
    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }

    throw error;
  }
}

export async function generateRandomLogs(count: number = 100, daysBack: number = 7): Promise<GenerateLogsResponse> {
  return generateLogs({ count, days_back: daysBack });
}
