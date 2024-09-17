import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { VehicleMakeService } from './vehicle-make.service';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

jest.mock('axios');
jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
}));

const mockVehicleMakeService = {
  clearDocuments: jest.fn(),
  create: jest.fn(),
  findByMakeId: jest.fn(),
};

describe('SeedService', () => {
  let service: SeedService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: VehicleMakeService,
          useValue: mockVehicleMakeService,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    logger = service.logger;

    jest.spyOn(logger, 'log').mockImplementation(jest.fn());
    jest.spyOn(logger, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seedVehicleMakes', () => {
    it('should seed vehicle makes from local file when SEED_SOURCE is LOCAL_FILE', async () => {
      process.env.SEED_SOURCE = 'LOCAL_FILE';
      const seedVehicleMakesFromLocalFileSpy = jest
        .spyOn(service as any, 'seedVehicleMakesFromLocalFile')
        .mockResolvedValueOnce(undefined);

      await service.seedVehicleMakes();

      expect(mockVehicleMakeService.clearDocuments).toHaveBeenCalled();
      expect(seedVehicleMakesFromLocalFileSpy).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith('Seeding from local file');
    });

    it('should seed vehicle makes from internet when SEED_SOURCE is INTERNET', async () => {
      process.env.SEED_SOURCE = 'INTERNET';
      const seedVehicleMakesFromInternetSpy = jest
        .spyOn(service as any, 'seedVehicleMakesFromInternet')
        .mockResolvedValueOnce(undefined);

      await service.seedVehicleMakes();

      expect(mockVehicleMakeService.clearDocuments).toHaveBeenCalled();
      expect(seedVehicleMakesFromInternetSpy).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith('Seeding from internet');
    });

    it('should log an error if SEED_SOURCE is invalid', async () => {
      process.env.SEED_SOURCE = 'INVALID_SOURCE';

      await service.seedVehicleMakes();

      expect(mockVehicleMakeService.clearDocuments).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'No valid seed source specified',
      );
    });
  });

  describe('seedVehicleMakesFromLocalFile', () => {
    it('should seed vehicle makes from local file', async () => {
      const mockVehicleMakes = [
        { makeId: '1', makeName: 'Toyota', vehicleTypes: [] },
        { makeId: '2', makeName: 'Honda', vehicleTypes: [] },
      ];

      jest
        .spyOn(fs, 'readFileSync')
        .mockReturnValue(JSON.stringify(mockVehicleMakes));

      await service['seedVehicleMakesFromLocalFile']();

      expect(mockVehicleMakeService.create).toHaveBeenCalledTimes(
        mockVehicleMakes.length,
      );
      expect(mockVehicleMakeService.create).toHaveBeenCalledWith(
        mockVehicleMakes[0],
      );
      expect(mockVehicleMakeService.create).toHaveBeenCalledWith(
        mockVehicleMakes[1],
      );
    });
  });

  describe('seedVehicleMakesFromInternet', () => {
    it('should fetch vehicle makes from internet and save them', async () => {
      const mockMakesResponse = {
        data: '<xml><Response><Results><AllVehicleMakes><Make_Name>Toyota</Make_Name><Make_ID>1</Make_ID></AllVehicleMakes></Results></Response></xml>',
      };
      const mockVehicleTypesResponse = {
        data: '<xml><Response><Results><VehicleTypesForMakeIds><VehicleTypeId>10</VehicleTypeId><VehicleTypeName>SUV</VehicleTypeName></VehicleTypesForMakeIds></Results></Response></xml>',
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(mockMakesResponse)
        .mockResolvedValueOnce(mockVehicleTypesResponse);

      (parseStringPromise as jest.Mock)
        .mockResolvedValueOnce({
          Response: {
            Results: [
              {
                AllVehicleMakes: [{ Make_Name: ['Toyota'], Make_ID: ['1'] }],
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          Response: {
            Results: [
              {
                VehicleTypesForMakeIds: [
                  { VehicleTypeId: ['10'], VehicleTypeName: ['SUV'] },
                ],
              },
            ],
          },
        });

      await service['seedVehicleMakesFromInternet']();

      expect(axios.get).toHaveBeenCalledTimes(2); // One for makes, one for vehicle types
      expect(mockVehicleMakeService.create).toHaveBeenCalledWith({
        makeId: '1',
        makeName: 'Toyota',
        vehicleTypes: [{ typeId: '10', typeName: 'SUV' }],
      });
      expect(logger.log).toHaveBeenCalledWith('Processing make 1 of 1');
    });

    it('should skip makes already in the database', async () => {
      const mockMakesResponse = {
        data: '<xml><Response><Results><AllVehicleMakes><Make_Name>Toyota</Make_Name><Make_ID>1</Make_ID></AllVehicleMakes></Results></Response></xml>',
      };

      (axios.get as jest.Mock).mockResolvedValueOnce(mockMakesResponse);

      (parseStringPromise as jest.Mock).mockResolvedValueOnce({
        Response: {
          Results: [
            {
              AllVehicleMakes: [{ Make_Name: ['Toyota'], Make_ID: ['1'] }],
            },
          ],
        },
      });

      (mockVehicleMakeService.findByMakeId as jest.Mock).mockResolvedValueOnce({
        makeId: '1',
        makeName: 'Toyota',
        vehicleTypes: [],
      });

      await service['seedVehicleMakesFromInternet']();

      expect(mockVehicleMakeService.create).not.toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(
        'Make with id 1 already in database',
      );
    });
  });
});
