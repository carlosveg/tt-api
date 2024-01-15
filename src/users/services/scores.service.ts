import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreDto } from '../dto/score.dto';
import { UserScores } from '../entities';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';

@Injectable()
export class ScoresService {
  private readonly logger = new Logger(ScoresService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserScores)
    private readonly userScoreRepository: Repository<UserScores>,
    private readonly userService: UsersService,
  ) {}

  async addScore(scoreDto: ScoreDto) {
    // Verificamos que los usuarios existan
    const usuarioCalificado = await this.userService.findOne(
      scoreDto.idUsuarioCalificado,
    );
    const usuarioCalificador = await this.userService.findOne(
      scoreDto.idUsuarioCalificador,
    );

    // const isAlreadyMadeScore = await this.userScoreRepository.findOne({
    //   where: {
    //     usuarioCalificador: { id: scoreDto.idUsuarioCalificador },
    //     usuarioCalificado: { id: scoreDto.idUsuarioCalificado },
    //   },
    // });

    // if (isAlreadyMadeScore)
    //   throw new BadRequestException(
    //     `El usuario ${usuarioCalificador.fullName} ya ha calificado al usuario ${usuarioCalificado.fullName}`,
    //   );

    const score = this.userScoreRepository.create({
      score: scoreDto.score,
      usuarioCalificador: usuarioCalificador,
      usuarioCalificado: usuarioCalificado,
    });

    await this.userScoreRepository.save(score);

    this.logger.log(
      `Recalculando el promedio de calificaciones para el usuario ${usuarioCalificado.fullName}`,
    );

    // Hacemos el cálculo del promedio de calificaciones para el usuario
    const scores = await this.userScoreRepository.find({
      where: { usuarioCalificado: { id: scoreDto.idUsuarioCalificado } },
    });

    usuarioCalificado.score = this.recalcular(scores);
    usuarioCalificado.countScores = scores.length;

    this.logger.log(
      `Se ha actualizado el score del usuario ${usuarioCalificado.fullName}`,
    );
    await this.userRepository.save(usuarioCalificado);

    return {
      status: HttpStatus.CREATED,
      message: 'Score was added successfuly',
    };
  }

  private recalcular(calificaciones: UserScores[]) {
    const sumaCalificaciones = calificaciones.reduce(
      (acc, score) => acc + +score.score,
      0,
    );
    const newScore = sumaCalificaciones / calificaciones.length;

    return Math.round(newScore * 10) / 10;
  }
}
