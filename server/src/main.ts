import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const stickerDirectory = [
    join(process.cwd(), 'stickers'),
    join(process.cwd(), 'server', 'stickers'),
  ].find(existsSync);
  app.setGlobalPrefix('api');
  app.enableCors();
  app
    .getHttpAdapter()
    .getInstance()
    .use('/api/uploads', express.static(join(process.cwd(), 'uploads')));
  app
    .getHttpAdapter()
    .getInstance()
    .use('/api/stickers', express.static(stickerDirectory ?? join(process.cwd(), 'stickers')));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
