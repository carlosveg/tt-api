import { Controller, Get, Param } from '@nestjs/common';
import { catalogEnum } from '../../common/enum';
import { CatalogoService } from '../services/catalogos.service';

@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('/:catalogo')
  findOne(@Param('catalogo') catalogo: catalogEnum) {
    return this.catalogoService.getCatalogo(catalogo);
  }
}
