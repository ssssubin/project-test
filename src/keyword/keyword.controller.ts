import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { TestService } from './keyword.service';

@Controller('test')
export class TestController {
  constructor(private testService: TestService) {}
  @Get()
  @ApiOperation({ summary: '키워드' })
  async getKeyword(@Query('keyword') keyword: string) {
    return await this.testService.getKeyword(keyword);
  }
}
