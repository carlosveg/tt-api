import { Controller, Get } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  async backup() {
    try {
      await this.backupService.performBackup();
      return { message: 'Backup completado correctamente.' };
    } catch (error) {
      return { error };
    }
  }
}
