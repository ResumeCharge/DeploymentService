import { Test, TestingModule } from '@nestjs/testing';
import { ResourceGuardsService } from './resource-guards.service';

describe('ResourceGuardsService', () => {
  let service: ResourceGuardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourceGuardsService],
    }).compile();

    service = module.get<ResourceGuardsService>(ResourceGuardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
