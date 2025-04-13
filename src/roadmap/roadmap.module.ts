import { Module } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { RoadmapController } from './roadmap.controller';

@Module({
  providers: [RoadmapService],
  controllers: [RoadmapController]
})
export class RoadmapModule {}
