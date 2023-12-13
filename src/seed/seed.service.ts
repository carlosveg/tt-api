import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { users } from './data/users';
import { Repository } from 'typeorm';
import { User, UserMinorista } from '../users/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Contrataciones } from '../users/entities/contratacion.entity';
import { MinoristaDto } from '../users/dto';
import { minoristaSeed } from './data/minoristas';

@Injectable()
export class SeedService {
  constructor(
    private readonly userService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
    @InjectRepository(Contrataciones)
    private readonly contratacionesRepository: Repository<Contrataciones>,
  ) {}

  async runSeed() {
    const users = await this.insertUsers();

    const adminFilter = users.filter((user) => user.userType === 'admin');
    const usersFilter = users.filter((user) => user.userType === 'user');
    const minoristasFilter = users.filter(
      (user) => user.userType === 'minorista',
    );

    const minoristas = await this.insertMinorista(minoristasFilter);

    await this.insertContrataciones(minoristas[1].id, minoristasFilter[7].id);

    return 'SEED executed';
  }

  async destroyDB() {
    // Esta linea elimina a los usuarios y en cascada todos los registros de la bd
    await this.userService.deleteAllUsers();
  }

  private async insertUsers() {
    // Antes de insertar, destruimos la BD por completo
    await this.destroyDB();
    const insertPromises: User[] = [];

    users.forEach((user: User) => {
      insertPromises.push(this.userRepository.create(user));
    });

    // await Promise.all(insertPromises);
    const usersDB = await this.userRepository.save(insertPromises);

    return usersDB;
  }

  private async insertMinorista(minoristasFilter: User[]) {
    const minoristasDB: UserMinorista[] = [];

    for (let i = 0; i < minoristaSeed.length; i++) {
      const dto: MinoristaDto = minoristaSeed[i];
      const userSeed = minoristasFilter[i];

      const minorista = this.minoristaRepository.create({
        id: userSeed.id,
        ...dto,
        user: userSeed,
      });

      minoristasDB.push(await this.minoristaRepository.save(minorista));
    }

    return minoristasDB;
  }

  private async insertContrataciones(
    idContratador: string,
    idContratado: string,
  ) {
    const contratador = await this.userRepository.findOne({
      where: { id: idContratador },
      relations: { favorites: true },
    });

    if (!contratador) throw new NotFoundException('User not found');

    const minorista = await this.minoristaRepository.findOne({
      where: { id: idContratado },
      relations: { user: true },
    });

    if (!minorista)
      throw new NotFoundException(
        `Minorista with id [${idContratado}] not found`,
      );

    const contratacion = this.contratacionesRepository.create({
      usuario: contratador,
      minorista,
    });

    const c = await this.contratacionesRepository.save(contratacion);
    console.log(c);
  }
}
