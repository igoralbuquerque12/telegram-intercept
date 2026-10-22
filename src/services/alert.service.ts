import { AlertProvider, SendAlertDTO } from "../entities/alert.entity";

export class AlertService {
  constructor(private readonly provider: AlertProvider) {}

  public async sendAlert(payload: SendAlertDTO): Promise<boolean> {
    return this.provider.send(payload);
  }
}

