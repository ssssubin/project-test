import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeywordController } from './keyword/keyword.controller';
import { KeywordService } from './keyword/keyword.service';
import { MySqlService } from './my-sql/my-sql.service';
import { RegionController } from './region/region.controller';
import { RegionService } from './region/region.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [AppController, KeywordController, RegionController],
  providers: [AppService, RegionService, MySqlService, KeywordService],
})
export class AppModule {}
