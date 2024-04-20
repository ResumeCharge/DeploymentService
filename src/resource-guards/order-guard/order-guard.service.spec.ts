import { Test, TestingModule } from '@nestjs/testing';
import { OrderGuardService } from './order-guard.service';

describe('OrderGuardService', () => {
  let service: OrderGuardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderGuardService],
    }).compile();

    service = module.get<OrderGuardService>(OrderGuardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
