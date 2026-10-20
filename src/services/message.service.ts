import { IncomingMessageDTO } from "../entities/message.entity";
import { AlertService } from "./alert.service";
import { CriteriaService } from "./criteria.service";

export class MessageService {
  private readonly criteriaService: CriteriaService;
  private readonly alertService: AlertService;

  constructor(
    criteriaService: CriteriaService,
    alertService: AlertService
  ) {
    this.criteriaService = criteriaService;
    this.alertService = alertService;
  }

  public async handleIncomingMessage(payload: IncomingMessageDTO): Promise<void> {
    const matchedCriteria = this.criteriaService.evaluate(payload);

    if (matchedCriteria.matches) {
      const content = `Um produto que você salvou foi encontrado no canal ${payload.senderName || "desconhecido"}: ${payload.text}`;
      await this.alertService.sendAlert({ content });
    }
  }
}