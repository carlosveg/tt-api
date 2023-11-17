import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { template } from './template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmail(userName: string, to: string[], content: string) {
    this.logger.log(`Iniciando envío de email hacía ${to}`);

    const transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_TT'),
        pass: this.configService.get<string>('KEY_EMAIL'),
      },
    });
    const options = {
      from: `TT admin <${this.configService.get<string>('EMAIL_TT')},>`, // sender address
      to, // receiver email
      subject: 'Estado de solicitud', // Subject line
      // text: 'Envio de prueba',
      html: template(userName, content),
    };

    try {
      const info = await transporter.sendMail(options);
      console.log(info);
      this.logger.log(`Envío de email exitoso`);
    } catch (error) {
      console.log(error);
      this.logger.error(`Ocurrio un error al enviar el email hacía ${to}`);
    }
  }
}
