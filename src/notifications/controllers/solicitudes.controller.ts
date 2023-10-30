import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { SolicitudesService } from '../services/solicitudes.service';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post('/create/:id')
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createSolicitudDto: CreateSolicitudDto,
  ) {
    return this.solicitudesService.create(id, createSolicitudDto);
  }

  @Get()
  findAll() {
    return this.solicitudesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.solicitudesService.remove(id);
  }

  @Post('/accept/:idSolicitud/:idUser')
  acceptSolicitud(
    @Param('idSolicitud') idSolicitud: string,
    @Param('idUser') idUser: string,
  ) {
    return this.solicitudesService.acceptSolicitud(idSolicitud, idUser);
  }

  @Post('/solicitarReactivacion/:id')
  solicitarReactivacionCuenta(@Param('id') id: string) {
    return this.solicitudesService.solicitarReactivacionCuenta(id);
  }

  @Post('/reactivate/:idSolicitud/:idUser')
  reactivateAccount(
    @Param('idSolicitud') idSolicitud: string,
    @Param('idUser') idUser: string,
  ) {
    return this.solicitudesService.reactivarCuenta(idSolicitud, idUser);
  }
}
