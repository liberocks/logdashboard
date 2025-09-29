import { ofetch } from "ofetch";
import { z } from "zod";

import { API_BASE_URL } from "@/constants";
import { LogModel } from "@/model";

import { GetLogResponse, GetLogResponseSchema } from "./get-log.schema";

export async function getLog(logId: string): Promise<LogModel> {
  if (!logId || typeof logId !== "string") {
    throw new Error("Log ID is required and must be a string");
  }

  try {
    const url = `${API_BASE_URL}/api/v1/logs/${encodeURIComponent(logId)}`;

    const response = await ofetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const validatedResponse = GetLogResponseSchema.parse(response);
    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }

    throw error;
  }
}
