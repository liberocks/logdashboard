import { ofetch } from "ofetch";

import { API_BASE_URL } from "@/constants";

export async function deleteLog(logId: string): Promise<void> {
  try {
    await ofetch(`${API_BASE_URL}/api/v1/logs/${logId}`, {
      method: "DELETE",
    });
  } catch (error) {
    throw error;
  }
}
