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

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getFavoritesByUser(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['favorites'],
      });

      if (!user) throw new NotFoundException(`User not found`);

      return user.favorites.map((fav) => {
        delete fav.curp;
        delete fav.password;
        delete fav.updatedAt;

        return fav;
      });
    } catch (error) {
      throw new Error(`Error while fetching favorites users: ${error.message}`);
    }
  }

  async addFavorite(id: string, favoriteUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { favorites: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const favoriteUser = await this.userRepository.findOne({
      where: { id: favoriteUserId },
    });

    if (!favoriteUser)
      throw new NotFoundException(
        `Favorite user [${favoriteUserId}] not found`,
      );

    if (!user.favorites.some((u) => u.curp === favoriteUserId)) {
      user.favorites.push(favoriteUser);
      await this.userRepository.save(user);
    } else throw new BadRequestException('User is already in your favorites');

    return {
      status: HttpStatus.OK,
      message: 'User favorite was added successfully',
    };
  }

  async removeFavorite(id: string, favoriteUserId: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['favorites'],
    });

    if (!user) throw new NotFoundException('User not found');

    const favoriteUserIndex = user.favorites.findIndex(
      (u) => u.id === favoriteUserId,
    );

    if (favoriteUserIndex === -1)
      throw new NotFoundException('Favorite user id not found');

    user.favorites.splice(favoriteUserIndex, 1);

    await this.userRepository.save(user);

    return {
      status: HttpStatus.OK,
      message: 'User favorite was deleted successfully',
    };
  }

  async isFavorite(idUser: string, idFavorite: string) {
    const favorites = await this.getFavoritesByUser(idUser);
    const ids = favorites.map((fav) => fav.id);

    return ids.includes(idFavorite);
  }
}
