import { env } from "../config/env";
import { AlertProvider, SendAlertDTO } from "../entities/alert.entity";
import { JarvisMessageRequestDTO } from "../entities/jarvis.entity";

export class JarvisService implements AlertProvider {
  public async send(payload: SendAlertDTO): Promise<boolean> {
    const baseUrl = this.getJarvisUrl().replace(/\/+$/, "");
    const url = `${baseUrl}/v1/messages`;
    const jarvisAdminKey = this.getJarvisAdminKey();

    const body: JarvisMessageRequestDTO = {
      message: payload.content,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jarvisAdminKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error(
          "[JarvisService] - Failed to send message to Jarvis. Status:",
          response.status,
          response.statusText
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("[JarvisService] - Error sending message to Jarvis:", error);
      return false;
    }
  }

  private getJarvisUrl(): string {
    return env.JARVIS.JARVIS_URL;
  }

  private getJarvisAdminKey(): string {
    if (!env.JARVIS.JARVIS_ADMIN_KEY) {
      throw new Error("JARVIS_ADMIN_KEY should be provided in the environment variables.");
    }
    return env.JARVIS.JARVIS_ADMIN_KEY;
  }
}
