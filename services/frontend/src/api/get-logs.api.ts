import { ofetch } from "ofetch";
import { z } from "zod";

import { API_BASE_URL } from "@/constants";
import { GetLogsParameter, GetLogsParameterSchema, GetLogsResponse, GetLogsResponseSchema } from "./get-logs.schema";

export async function getLogs(params?: Partial<GetLogsParameter>): Promise<GetLogsResponse> {
  const validatedParams = GetLogsParameterSchema.parse(params || {});

  try {
    const searchParams = new URLSearchParams();

    if (validatedParams.severity) {
      searchParams.append("severity", validatedParams.severity);
    }
    if (validatedParams.source) {
      searchParams.append("source", validatedParams.source);
    }
    if (validatedParams.start_date) {
      searchParams.append("start_date", validatedParams.start_date);
    }
    if (validatedParams.end_date) {
      searchParams.append("end_date", validatedParams.end_date);
    }
    searchParams.append("limit", validatedParams.limit.toString());
    searchParams.append("offset", validatedParams.offset.toString());

    const url = `${API_BASE_URL}/logs${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const response = await ofetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const validatedResponse = GetLogsResponseSchema.parse(response);
    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }

    throw error;
  }
}
