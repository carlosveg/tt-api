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

  @Post('/requestMinorista/:id')
  requestMinorista(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createSolicitudDto: CreateSolicitudDto,
  ) {
    return this.solicitudesService.requestMinorista(id, createSolicitudDto);
  }

  @Post('/solicitarReactivacion/:id')
  solicitarReactivacionCuenta(@Param('id') id: string) {
    return this.solicitudesService.solicitarReactivacionCuenta(id);
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

  /* 
    Sección para aceptar o rechazar solicitudes
   */

  @Post('/acceptMinorista/:idSolicitud/:idUser')
  acceptMinorista(
    @Param('idSolicitud') idSolicitud: string,
    @Param('idUser') idUser: string,
  ) {
    return this.solicitudesService.convertMinorista(idSolicitud, idUser);
  }

  @Post('/rejectMinorista/:idSolicitud/:idUser')
  rejectMinorista(
    @Param('idSolicitud') idSolicitud: string,
    @Param('idUser') idUser: string,
  ) {
    return this.solicitudesService.rejectSolicitud(idSolicitud, idUser);
  }

  @Post('/acceptReactivateAccount/:idSolicitud/:idUser')
  acceptReactivateAccount(
    @Param('idSolicitud') idSolicitud: string,
    @Param('idUser') idUser: string,
  ) {
    return this.solicitudesService.reactivarCuenta(idSolicitud, idUser);
  }

  @Post('/rejectReactivateAccount/:idSolicitud/:idUser')
  rejectReactivateAccount(
    @Param('idSolicitud') idSolicitud: string,
    @Param('idUser') idUser: string,
  ) {
    return this.solicitudesService.rechazoReactivarCuenta(idSolicitud, idUser);
  }
}
