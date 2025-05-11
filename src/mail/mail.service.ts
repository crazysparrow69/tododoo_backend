import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateEmailOptions, Resend } from "resend";

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get("RESEND_API_KEY"));
  }

  async send(options: CreateEmailOptions): Promise<void> {
    try {
      await this.resend.emails.send(options);
      console.debug(`Email has been sent to: ${options.to}`);
    } catch (error) {
      throw error;
    }
  }
}
