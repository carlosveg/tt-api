import { Injectable, Logger } from '@nestjs/common';
import { Transport, createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { template } from './templates/template';
import { templateContratacion } from './templates/contratacion';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_TT'),
        pass: this.configService.get<string>('KEY_EMAIL'),
      },
    });
  }

  async sendEmail(userName: string, to: string[], content: string) {
    this.logger.log(`[SOLICITUD] Iniciando envío de email hacía ${to}`);

    const options = {
      from: `TT admin <${this.configService.get<string>('EMAIL_TT')},>`,
      to,
      subject: 'Estado de solicitud',
      // text: 'Envio de prueba',
      html: template(userName, content),
    };

    try {
      const info = await this.transporter.sendMail(options);
      console.log(info);
      this.logger.log(`[SOLICITUD] Envío de email exitoso`);
    } catch (error) {
      console.log(error);
      this.logger.error(
        `[SOLICITUD] Ocurrio un error al enviar el email hacía ${to}`,
      );
    }
  }

  async sendEmailContratacion(from: string, to: string[], content: string) {
    this.logger.log(`[CONTRATACION] Iniciando envío de email hacía ${to}`);

    const options = {
      from: `TT admin <${this.configService.get<string>('EMAIL_TT')},>`,
      cc: from,
      to,
      subject: 'Solicitud de contratación',
      // text: 'Envio de prueba',
      html: templateContratacion(content + `<p>Contacto: ${from}.</p>`),
    };

    try {
      const info = await this.transporter.sendMail(options);
      console.log(info);
      this.logger.log(`[CONTRATACION] Envío de email exitoso`);
    } catch (error) {
      console.log(error);
      this.logger.error(
        `[CONTRATACION] Ocurrio un error al enviar el email hacía ${to}`,
      );
    }
  }

  async sendEmailNotificacion(to: string[], content: string) {
    this.logger.log(`[NOTIFICACION] Iniciando envío de email hacía ${to}`);

    const options = {
      from: `TT admin <${this.configService.get<string>('EMAIL_TT')},>`,
      to,
      subject: 'Notificación de nueva publicación',
      // text: 'Envio de prueba',
      html: templateContratacion(content),
    };

    try {
      const info = await this.transporter.sendMail(options);
      console.log(info);
      this.logger.log(`[NOTIFICACION] Envío de email exitoso`);
    } catch (error) {
      console.log(error);
      this.logger.error(
        `[NOTIFICACION] Ocurrio un error al enviar el email hacía ${to}`,
      );
    }
  }
}
