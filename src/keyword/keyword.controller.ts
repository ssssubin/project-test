import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { KeywordService } from './keyword.service';

@Controller('keyword')
export class KeywordController {
  constructor(private keywordService: KeywordService) {}
  @Get()
  @ApiOperation({ summary: '키워드' })
  async getKeyword(@Query('keyword') keyword: string) {
    return await this.keywordService.getKeyword(keyword);
  }
}
