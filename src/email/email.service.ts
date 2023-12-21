import { Injectable, Logger } from '@nestjs/common';
import { Transport, createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { template } from './templates/template';
import { templateContratacion } from './templates/contratacion';
import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
} from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter;
  private readonly sesClient: SESClient;

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

    this.sesClient = new SESClient({
      region: this.configService.get<string>('SES_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('SES_AWS_PUBLIC_KEY'),
        secretAccessKey: this.configService.get<string>('SES_AWS_SECRET_KEY'),
      },
    });
  }

  async sendEmailSES(to: string[], template: string, subject: string) {
    const emailCommand = new SendEmailCommand({
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: to,
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: 'UTF-8',
            Data: template,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: this.configService.get<string>('EMAIL_TT'),
    });

    await this.sesClient.send(emailCommand);
  }

  async sendEmail(userName: string, to: string[], content: string) {
    this.logger.log(
      `[SOLICITUD] Iniciando envío de email con NODEMAILER hacía ${to}`,
    );

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
        `[SOLICITUD] Ocurrio un error al enviar el email con NODEMAILER hacía ${to}`,
      );

      this.logger.log(`[SOLICITUD] Intentando envío de email con AWS SES`);
      this.sendEmailSES(to, template(userName, content), 'Estado de solicitud');
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

      this.logger.log(`[CONTRATACION] Intentando envío de email con AWS SES`);
      const emailCommand = new SendEmailCommand({
        Destination: {
          /* required */
          CcAddresses: [from],
          ToAddresses: to,
        },
        Message: {
          /* required */
          Body: {
            /* required */
            Html: {
              Charset: 'UTF-8',
              Data: templateContratacion(content + `<p>Contacto: ${from}.</p>`),
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Solicitud de contratación',
          },
        },
        Source: this.configService.get<string>('EMAIL_TT'),
      });

      await this.sesClient.send(emailCommand);
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

      this.logger.log(`[NOTIFICACION] Intentando envío de email con AWS SES`);
      this.sendEmailSES(
        to,
        templateContratacion(content),
        'Notificación de nueva publicación',
      );
    }
  }
}
