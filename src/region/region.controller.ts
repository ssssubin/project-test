import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegionService } from './region.service';

@Controller('region')
export class RegionController {
  constructor(private regionService: RegionService) {}
  @Get()
  @ApiTags('Region')
  @ApiOperation({ summary: '지역 기반 여행지 추천 API' })
  async getRegion(@Query('region') region: string) {
    return await this.regionService.getRegion(region);
  }
}
