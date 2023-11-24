import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ContratacionesService } from '../services/contrataciones.service';
import { ContratacionDto } from '../dto/contratacion.dto';

@Controller('contrataciones')
export class ContratacionesController {
  constructor(private readonly contratacionesService: ContratacionesService) {}

  @Get(':idUser')
  getByUser(@Param('idUser', ParseUUIDPipe) idUser: string) {
    return this.contratacionesService.getContratacionesByUser(idUser);
  }

  @Post('create/:idContratador/:idContratado')
  create(
    @Param('idContratador', ParseUUIDPipe) idContratador: string,
    @Param('idContratado', ParseUUIDPipe) idContratado: string,
    @Body() contratacionDto: ContratacionDto,
  ) {
    return this.contratacionesService.create(
      idContratador,
      idContratado,
      contratacionDto,
    );
  }

  @Delete('remove/:idContratador/:idContratado')
  // @Auth()
  remove(
    @Param('idContratador', ParseUUIDPipe) idContratador: string,
    @Param('idContratado', ParseUUIDPipe) idContratado: string,
  ) {
    return this.contratacionesService.remove(idContratador, idContratado);
  }

  @Post('validate/:idContratador/:idContratado')
  validateContratacion(
    @Param('idContratador', ParseUUIDPipe) idContratador: string,
    @Param('idContratado', ParseUUIDPipe) idContratado: string,
  ) {
    return this.contratacionesService.validateContratacion(
      idContratador,
      idContratado,
    );
  }
}
