import { API_BASE_URL } from "@/constants";
import { GetLogsParameter, GetLogsParameterSchema } from "./get-logs.schema";
import { ofetch } from "ofetch";
import { z } from "zod";

export async function downloadLogs(params?: Partial<GetLogsParameter>): Promise<Blob> {
  const validatedParams = GetLogsParameterSchema.parse({
    ...params,
    limit: params?.limit || 10000,
  });

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

    const url = `${API_BASE_URL}/logs/download${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const response = await ofetch(url, {
      method: "GET",
      responseType: "blob",
    });

    return response as Blob;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    }

    throw error;
  }
}

export async function downloadLogsAsFile(filename: string = "logs.csv", params?: Partial<GetLogsParameter>): Promise<void> {
  try {
    const blob = await downloadLogs(params);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}
