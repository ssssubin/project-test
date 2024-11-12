import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Pianta API 문서')
    .setDescription('식물 판매 사이트 API 문서')
    .setVersion('1.0.0')
    .addCookieAuth('userCookies')
    .addCookieAuth('adminCookies')
    .addCookieAuth('guestCookies')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
