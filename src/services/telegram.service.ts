import { StringSession } from "telegram/sessions";
import { TelegramClient } from "telegram";
import input from "input";

import { NewMessage, NewMessageEvent } from "telegram/events";
import { MessageService } from "./message.service";
import { env } from "../config/env";

export class TelegramService {
  private client: TelegramClient;
  private stringSession: StringSession;

  constructor(private readonly messageService: MessageService) {
    this.stringSession = new StringSession(env.TELEGRAM.SESSION);
    this.client = new TelegramClient(
      this.stringSession,
      env.TELEGRAM.API_ID,
      env.TELEGRAM.API_HASH,
      { 
        connectionRetries: 5,
        useWSS: true,
      }
    );
  }

  public async start(): Promise<void> {
    await this.client.start({
      phoneNumber: async () => await input.text("Enter your phone number (+1...): "),
      password: async () => await input.text("Enter your 2FA password (if any): "),
      phoneCode: async () => await input.text("Enter the code received on Telegram: "),
      onError: (err) => console.error("Authentication error:", err),
    });

    if (process.env.ENV === "development") {
      // Used for save the session string for the first time, so you can store it in your .env file and avoid logging in every time.
      console.log("[Telegram] Current session:", this.getLogSessionString());
    }

    this.registerEvents();
  }

  private getLogSessionString(): void {
    return this.client.session.save();  
  }

  private registerEvents(): void {
    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        const message = event.message;

        if (message.out) return;

        const sender = await message.getSender();
        const chat = await message.getChat();

        const senderName = (sender as any)?.firstName || (sender as any)?.title || "Unknown";
        const chatTitle = (chat as any)?.title || "Private Chat";

        await this.messageService.handleIncomingMessage({
          senderId: sender?.id?.toString(),
          senderName,
          chatId: chat?.id?.toString(),
          chatTitle,
          text: message.text || "",
          date: new Date(message.date * 1000),
        });
      },
      new NewMessage({ incoming: true })
    );
  }

  public isConnected(): boolean {
    return this.client.connected || false;
  }
}