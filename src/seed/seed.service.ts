import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService {
  constructor(private readonly userService: UsersService) {}

  async runSeed() {
    await this.insertInfo();
    return 'SEED executed';
  }

  private async insertInfo() {
    /* const users = initialData.users;

    const insertPromises = [];

    users.forEach((user) => {
      insertPromises.push(this.userService.create(user));
    });

    await Promise.all(insertPromises);

    await this.userService.deleteAllUsers(); */
  }
}
