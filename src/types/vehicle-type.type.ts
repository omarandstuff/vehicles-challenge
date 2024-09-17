import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Vehicle Type' })
export class VehicleType {
  @Field(() => ID)
  typeId: string;

  @Field()
  typeName: string;
}
