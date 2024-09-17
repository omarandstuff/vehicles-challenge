import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { VehicleMakeService } from '../services/vehicle-make.service';
import { VehicleMake } from '../types/vehicle-make.type';
import { VehicleMakeConnection } from '../types/vehicle-make-connection.type';

@Resolver(() => VehicleMake)
export class VehicleMakeResolver {
  constructor(private readonly vehicleMakeService: VehicleMakeService) {}

  @Query(() => VehicleMakeConnection)
  async getVehicleMakes(
    @Args('first', { type: () => Int, defaultValue: 10 }) first: number,
    @Args('after', { nullable: true }) after?: string,
  ): Promise<VehicleMakeConnection> {
    return this.vehicleMakeService.findAllPaginated(first, after);
  }
}
