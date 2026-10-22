export interface SendAlertDTO {
  content: string;
}

export interface AlertProvider {
  send(payload: SendAlertDTO): Promise<boolean>;
}

