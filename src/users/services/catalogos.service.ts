import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { catalogEnum } from '../../common/enum';
import { UserMinorista } from '../entities';

@Injectable()
export class CatalogoService {
  private readonly logger = new Logger(CatalogoService.name);

  constructor(
    @InjectRepository(UserMinorista)
    private readonly minoristaRepository: Repository<UserMinorista>,
  ) {}

  async getCatalogo(catalogo: catalogEnum) {
    const isInEnum = Object.values(catalogEnum).includes(catalogo);

    if (!isInEnum)
      throw new BadRequestException(`No existe el catalogo '${catalogo}'`);

    return await this.minoristaRepository.find({
      where: { ocupacion: catalogo },
      relations: { user: true },
    });
  }
}
