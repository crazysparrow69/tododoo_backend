// src/mail/mail.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get("SENDGRID_API_KEY"));
  }

  async send(mail: SendGrid.MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(mail);
    } catch (error) {
      throw error;
    }
  }
}
