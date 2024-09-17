import { Test, TestingModule } from '@nestjs/testing';
import { VehicleMakeResolver } from './vehicle-make.resolver';
import { VehicleMakeService } from '../services/vehicle-make.service';
import { VehicleMakeConnection } from '../types/vehicle-make-connection.type';

describe(VehicleMakeResolver, () => {
  let resolver: VehicleMakeResolver;
  let vehicleMakeService: VehicleMakeService;

  const mockVehicleMakeService = {
    findAllPaginated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleMakeResolver,
        {
          provide: VehicleMakeService,
          useValue: mockVehicleMakeService,
        },
      ],
    }).compile();

    resolver = module.get<VehicleMakeResolver>(VehicleMakeResolver);
    vehicleMakeService = module.get<VehicleMakeService>(VehicleMakeService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getVehicleMakes', () => {
    it('should return paginated vehicle makes', async () => {
      const paginatedResponse: VehicleMakeConnection = {
        edges: [
          {
            cursor: '1',
            node: {
              makeId: '1',
              makeName: 'Toyota',
              vehicleTypes: [],
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: '1',
        },
      };

      mockVehicleMakeService.findAllPaginated.mockResolvedValue(
        paginatedResponse,
      );

      const result = await resolver.getVehicleMakes(10, undefined);

      expect(vehicleMakeService.findAllPaginated).toHaveBeenCalledWith(
        10,
        undefined,
      );
      expect(result).toEqual(paginatedResponse);
    });

    it('should return an empty result if no vehicle makes are found', async () => {
      const emptyResponse: VehicleMakeConnection = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          endCursor: undefined,
        },
      };

      mockVehicleMakeService.findAllPaginated.mockResolvedValue(emptyResponse);

      const result = await resolver.getVehicleMakes(10, undefined);

      expect(result.edges).toHaveLength(0);
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.endCursor).toBeUndefined();
    });

    it('should handle the after cursor properly', async () => {
      const paginatedResponseWithCursor: VehicleMakeConnection = {
        edges: [
          {
            cursor: '2',
            node: {
              makeId: '2',
              makeName: 'Honda',
              vehicleTypes: [],
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: '2',
        },
      };

      mockVehicleMakeService.findAllPaginated.mockResolvedValue(
        paginatedResponseWithCursor,
      );

      const result = await resolver.getVehicleMakes(5, '1');

      expect(vehicleMakeService.findAllPaginated).toHaveBeenCalledWith(5, '1');
      expect(result.pageInfo.endCursor).toBe('2');
    });
  });
});
