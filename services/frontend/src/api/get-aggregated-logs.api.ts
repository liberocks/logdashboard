import { ofetch } from "ofetch";
import { z } from "zod";

import { API_BASE_URL } from "@/constants";

import { GetAggregatedLogsResponse, GetAggregatedLogsResponseSchema } from "./get-aggregated-logs.schema";
import { GetLogsParameter, GetLogsParameterSchema } from "./get-logs.schema";

export async function getAggregatedLogs(params?: GetLogsParameter): Promise<GetAggregatedLogsResponse> {
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

    const url = `${API_BASE_URL}/api/v1/logs/aggregated${searchParams.toString() ? "?" + searchParams.toString() : ""}`;

    const response = await ofetch(url, {
      method: "GET",
    });

    const validatedResponse = GetAggregatedLogsResponseSchema.parse(response);
    return validatedResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }

    throw error;
  }
}
