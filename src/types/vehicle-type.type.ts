import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Vehicle Type' })
export class VehicleType {
  @Field((type) => ID)
  typeId: string;

  @Field()
  typeName: string;
}
