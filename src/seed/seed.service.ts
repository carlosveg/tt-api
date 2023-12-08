import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { users } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly userService: UsersService) {}

  async runSeed() {
    await this.insertInfo();
    return 'SEED executed';
  }

  async destroyDB() {
    // Esta linea elimina a los usuarios y en cascada todos los registros de la bd
    await this.userService.deleteAllUsers();
  }

  private async insertInfo() {
    await this.destroyDB();
    const insertPromises = [];

    users.forEach((user) => {
      insertPromises.push(this.userService.create(user));
    });

    await Promise.all(insertPromises);
  }
}
