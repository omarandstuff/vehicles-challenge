import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { VehicleMakeService } from './vehicle-make.service';

@Injectable()
export class SeedService {
  public readonly logger = new Logger(SeedService.name);

  constructor(private readonly vehicleMakeService: VehicleMakeService) {}

  async seedVehicleMakes(): Promise<void> {
    this.vehicleMakeService.clearDocuments();

    switch (process.env.SEED_SOURCE) {
      case 'LOCAL_FILE':
        this.logger.log('Seeding from local file');
        await this.seedVehicleMakesFromLocalFile();
        break;
      case 'INTERNET':
        this.logger.log('Seeding from internet');
        await this.seedVehicleMakesFromInternet();
        break;
      default:
        this.logger.error('No valid seed source specified');
        break;
    }
  }

  private async seedVehicleMakesFromLocalFile(): Promise<void> {
    const loadedData: any[] = require('../seed-data/vehicle-makes.json');

    for (let i = 0; i < loadedData.length; i++) {
      const currentMake = loadedData[i];
      await this.vehicleMakeService.create(currentMake);
    }
  }

  private async seedVehicleMakesFromInternet(): Promise<void> {
    const MAKES_URL =
      'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML';
    const VEHICLE_TYPES_URL =
      'https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/{{MAKE_ID}}?format=xml';

    const response = await axios.get(MAKES_URL);
    const xml = response.data;
    const fromXmlToJson = await parseStringPromise(xml);
    const makesInResponse: Record<string, any>[] =
      fromXmlToJson['Response']['Results'][0]['AllVehicleMakes'];

    for (let i = 0; i < makesInResponse.length; i++) {
      this.logger.log(`Processing make ${i + 1} of ${makesInResponse.length}`);

      const currentMake = makesInResponse[i];
      const makeName: string = currentMake['Make_Name'][0];
      const makeId: string = currentMake['Make_ID'][0];

      const alreadyInDb = await this.vehicleMakeService.findByMakeId(makeId);

      if (alreadyInDb) {
        this.logger.log(`Make with id ${makeId} already in database`);
        continue;
      }

      const vehicleTypesResponse = await axios.get(
        VEHICLE_TYPES_URL.replace('{{MAKE_ID}}', makeId),
      );
      const vehicleTypesXml = vehicleTypesResponse.data;
      const vehicleTypesFromXmlToJson =
        await parseStringPromise(vehicleTypesXml);
      const vehicleTypesInResponse =
        vehicleTypesFromXmlToJson['Response']['Results'][0][
          'VehicleTypesForMakeIds'
        ];

      if (vehicleTypesInResponse) {
        const normalizedVehicleTypes = vehicleTypesInResponse.map(
          (vehicleType: any) => {
            return {
              typeId: vehicleType['VehicleTypeId'][0],
              typeName: vehicleType['VehicleTypeName'][0],
            };
          },
        );

        await this.vehicleMakeService.create({
          makeId: makeId,
          makeName: makeName,
          vehicleTypes: normalizedVehicleTypes,
        });
      } else {
        await this.vehicleMakeService.create({
          makeId: makeId,
          makeName: makeName,
          vehicleTypes: [],
        });
      }
    }
  }
}
