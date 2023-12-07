import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private region: string;
  private s3: S3Client;
  private logger = new Logger(S3Service.name);

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('BUCKET_REGION');
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        secretAccessKey: this.configService.get<string>(
          'BUCKET_AWS_SECRET_KEY',
        ),
        accessKeyId: this.configService.get<string>('BUCKET_AWS_PUBLIC_KEY'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, uniqueName: string) {
    this.logger.log(`Subiendo archivo ${uniqueName} a S3`);

    const bucket = this.configService.get<string>('BUCKET_NAME');
    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: bucket,
      Key: uniqueName,
      ContentType: 'auto',
      // ACL: '',
    };

    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(input),
      );

      if (response.$metadata.httpStatusCode === 200) {
        this.logger.log(`Subida de archivo exitosa`);
        return `https://${bucket}.s3.amazonaws.com/${uniqueName}`;
      }

      this.logger.error(`La imagen no fue subida a S3`);
      throw new Error('La imagen no fue subida a S3');
    } catch (error) {
      this.logger.error('No se almaceno el archivo en s3 ', error);
      throw error;
    }
  }

  async uploadFiles(files: Express.Multer.File[]) {
    this.logger.log(`Subiendo múltiples archivos a S3`);

    const bucket = this.configService.get<string>('BUCKET_NAME');
    const uploadPromises: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = `${file.originalname.split('.')[0]}${Date.now()}.${
        file.originalname.split('.')[1]
      }`;

      const input: PutObjectCommandInput = {
        Body: file.buffer,
        Bucket: bucket,
        Key: key,
        ContentType: 'auto',
        // ACL: '',
      };

      try {
        const imageRes: PutObjectCommandOutput = await this.s3.send(
          new PutObjectCommand(input),
        );
        if (imageRes.$metadata.httpStatusCode === 200) {
          const fileUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
          uploadPromises.push(Promise.resolve(fileUrl));
        } else {
          this.logger.log(`Ocurrió un error al subir archivo ${key} a S3`);
          throw new Error(`Ocurrió un error al subir archivo ${key} a S3`);
        }
      } catch (error) {
        this.logger.error('No se almaceno el archivo en S3', error);
        throw error;
      }
    }

    return Promise.all(uploadPromises);
  }
}
