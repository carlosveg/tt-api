import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { PostsModule } from '../posts/posts.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [UsersModule, AuthModule, PostsModule],
})
export class SeedModule {}
