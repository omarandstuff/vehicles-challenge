import { ObjectType, Field } from '@nestjs/graphql';
import { VehicleMake } from './vehicle-make.type';

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
export class VehicleMakeEdge {
  @Field()
  cursor: string;

  @Field(() => VehicleMake)
  node: VehicleMake;
}

@ObjectType()
export class VehicleMakeConnection {
  @Field(() => [VehicleMakeEdge])
  edges: VehicleMakeEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
