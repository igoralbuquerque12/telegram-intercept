import express from "express";
import { env } from "./config/env";
import { AlertService } from "./services/alert.service";
import { CriteriaService } from "./services/criteria.service";
import { JarvisService } from "./services/jarvis.service";
import { MessageService } from "./services/message.service";
import { TelegramService } from "./services/telegram.service";

async function bootstrap() {
  const criteriaService = new CriteriaService();
  const jarvisProvider = new JarvisService();
  const alertService = new AlertService(jarvisProvider);
  const messageService = new MessageService(criteriaService, alertService);
  const telegramService = new TelegramService(messageService);

  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok", telegramConnected: telegramService.isConnected() });
  });

  const port = env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Express server is running on port ${port}`);
  });

  console.log("Starting Telegram Bot...");
  await telegramService.start();
  
  if (telegramService.isConnected()) {
    console.log("Telegram Bot is running and listening for messages!");
  } else {
    console.log("There was a problem connecting the Telegram Bot.");
  }
}

bootstrap().catch(console.error);
