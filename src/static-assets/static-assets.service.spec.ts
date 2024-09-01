import { Test, TestingModule } from '@nestjs/testing';
import { StaticAssetsService } from './static-assets.service';

describe('StaticAssetsService', () => {
  let service: StaticAssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaticAssetsService],
    }).compile();

    service = module.get<StaticAssetsService>(StaticAssetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
