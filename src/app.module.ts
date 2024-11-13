import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestController } from './keyword/keyword.controller';
import { TestService } from './keyword/keyword.service';
import { MySqlService } from './my-sql/my-sql.service';

@Module({
  imports: [],
  controllers: [AppController, TestController],
  providers: [AppService, TestService, MySqlService],
})
export class AppModule {}
