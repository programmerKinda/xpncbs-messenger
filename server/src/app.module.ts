import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { VKVideoService } from './vkvideo.service';
import { YouTubePreviewService } from './youtube-preview.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '1234',
      database: 'xpncbs_messenger',

      autoLoadEntities: true,
      synchronize: true,
    }),

    AuthModule,
  ],

  controllers: [AppController],

  providers: [AppService, YouTubePreviewService, VKVideoService],
})
export class AppModule {}
