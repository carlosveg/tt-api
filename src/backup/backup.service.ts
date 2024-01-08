import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class BackupService {
  async performBackup() {
    const userName =
      process.env.STAGE === 'prod'
        ? process.env.DB_USERNAME
        : process.env.DB_USERNAME_DEV;
    const databaseName =
      process.env.STAGE === 'prod'
        ? process.env.DB_NAME
        : process.env.DB_NAME_DEV;
    const backupFileName = 'backup.sql';

    const command = `pg_dump -U ${userName} -p 5434 -h localhost -d ${databaseName} > ${backupFileName}`;

    return new Promise<void>((resolve, reject) => {
      exec(command, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
