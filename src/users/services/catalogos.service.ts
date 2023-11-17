import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserMinorista } from '../entities';
import { catalogEnum } from '../../common/enum';

@Injectable()
export class CatalogoService {
  private readonly logger = new Logger(CatalogoService.name);

  constructor(
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
  ) {}

  async getCatalogo(catalogo: catalogEnum) {
    const isInEnum = Object.values(catalogEnum).includes(catalogo);
    return await this.minoristaRepository.find({
      where: { ocupacion: catalogo },
      relations: { user: true },
    });
  }
}
