import { Test, TestingModule } from '@nestjs/testing';
import { VehicleMakeService } from './vehicle-make.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleMake } from '../schemas/vehicle-make.schema';
import { CreateVehicleMakeDto } from 'src/dtos/create-vehicle-make.dto';
import { VehicleMakeConnection } from 'src/types/vehicle-make-connection.type';

const mockVehicleMakeModel = class {
  static create = jest.fn();
  static findOne = jest.fn();
  static find = jest.fn();
  static deleteMany = jest.fn();
};

describe('VehicleMakeService', () => {
  let service: VehicleMakeService;
  let model: Model<VehicleMake>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleMakeService,
        {
          provide: getModelToken(VehicleMake.name),
          useValue: mockVehicleMakeModel,
        },
      ],
    }).compile();

    service = module.get<VehicleMakeService>(VehicleMakeService);
    model = module.get<Model<VehicleMake>>(getModelToken(VehicleMake.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new VehicleMake', async () => {
      const createVehicleMakeDto: CreateVehicleMakeDto = {
        makeId: '1',
        makeName: 'Toyota',
        vehicleTypes: [],
      };

      mockVehicleMakeModel.create.mockReturnValue(createVehicleMakeDto);

      const result = await service.create(createVehicleMakeDto);
      expect(result).toEqual(createVehicleMakeDto);
      expect(model.create).toHaveBeenCalledWith(createVehicleMakeDto);
    });
  });

  describe('findByMakeId', () => {
    it('should return a VehicleMake by makeId', async () => {
      const mockVehicleMake = {
        makeId: '1',
        makeName: 'Toyota',
        vehicleTypes: [],
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockVehicleMake),
      } as any);

      const result = await service.findByMakeId('1');
      expect(result).toEqual(mockVehicleMake);
      expect(model.findOne).toHaveBeenCalledWith({ makeId: '1' });
    });

    it('should return null if VehicleMake is not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.findByMakeId('non-existent-id');
      expect(result).toBeNull();
      expect(model.findOne).toHaveBeenCalledWith({ makeId: 'non-existent-id' });
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated vehicle makes', async () => {
      const mockVehicleMakes = [
        {
          _id: '1',
          makeId: '1',
          makeName: 'Toyota',
          vehicleTypes: [],
        },
        {
          _id: '2',
          makeId: '2',
          makeName: 'Honda',
          vehicleTypes: [],
        },
      ];

      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVehicleMakes),
      } as any);

      const result = await service.findAllPaginated(1);

      const expectedResponse: VehicleMakeConnection = {
        edges: [
          {
            cursor: '1',
            node: mockVehicleMakes[0],
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: '1',
        },
      };

      expect(result).toEqual(expectedResponse);
      expect(model.find).toHaveBeenCalledWith({});
    });

    it('should return empty edges if no vehicle makes are found', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.findAllPaginated(1);
      expect(result.edges).toHaveLength(0);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('should handle the after cursor', async () => {
      const mockVehicleMakes = [
        {
          _id: '3',
          makeId: '3',
          makeName: 'Ford',
          vehicleTypes: [],
        },
      ];

      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVehicleMakes),
      } as any);

      const result = await service.findAllPaginated(1, '2');

      expect(model.find).toHaveBeenCalledWith({ _id: { $gt: '2' } });
      expect(result.edges[0].node.makeId).toBe('3');
    });
  });

  describe('clearDocuments', () => {
    it('should clear all VehicleMake documents', async () => {
      jest.spyOn(model, 'deleteMany').mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      } as any);

      await service.clearDocuments();
      expect(model.deleteMany).toHaveBeenCalledWith({});
    });
  });
});
