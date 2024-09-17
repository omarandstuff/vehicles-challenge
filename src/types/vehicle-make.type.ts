import { Field, ObjectType, ID } from '@nestjs/graphql';
import { VehicleType } from './vehicle-type.type';

@ObjectType({ description: 'Vehicle Make' })
export class VehicleMake {
  @Field(() => ID)
  makeId: string;

  @Field()
  makeName: string;

  @Field(() => [VehicleType])
  vehicleTypes: VehicleType[];
}
