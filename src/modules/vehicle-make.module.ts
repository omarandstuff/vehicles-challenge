import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleMake, VehicleMakeSchema } from '../schemas/vehicle-make.schema';
import { VehicleType, VehicleTypeSchema } from '../schemas/vehicle-type.schema';
import { VehicleMakeService } from '../services/vehicle-make.service';
import { SeedService } from '../services/seed.service';
import { VehicleMakeResolver } from '../resolvers/vehicle-make.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VehicleMake.name, schema: VehicleMakeSchema },
      { name: VehicleType.name, schema: VehicleTypeSchema },
    ]),
  ],
  controllers: [],
  providers: [VehicleMakeService, SeedService, VehicleMakeResolver],
})
export class VehicleMakeModule {}
