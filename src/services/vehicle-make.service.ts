import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleMake } from '../schemas/vehicle-make.schema';
import { CreateVehicleMakeDto } from 'src/dtos/create-vehicle-make.dto';
import { VehicleMakeConnection } from 'src/types/vehicle-make-connection.type';

@Injectable()
export class VehicleMakeService {
  private readonly logger = new Logger(VehicleMakeService.name);

  constructor(
    @InjectModel(VehicleMake.name) private vehicleMakeModel: Model<VehicleMake>,
  ) {}

  async create(
    createVehicleMakeDto: CreateVehicleMakeDto,
  ): Promise<VehicleMake> {
    return await this.vehicleMakeModel.create(createVehicleMakeDto);
  }

  async findByMakeId(makeId: string): Promise<VehicleMake | null> {
    return this.vehicleMakeModel.findOne({ makeId }).exec();
  }

  async findAllPaginated(
    first: number,
    after?: string,
  ): Promise<VehicleMakeConnection> {
    const query = after ? { _id: { $gt: after } } : {};

    const vehicleMakes = await this.vehicleMakeModel
      .find(query)
      .limit(first + 1)
      .exec();

    const edges = vehicleMakes.slice(0, first).map((vehicleMake) => ({
      cursor: String(vehicleMake._id),
      node: vehicleMake,
    }));

    const hasNextPage = vehicleMakes.length > first;
    const endCursor =
      edges.length > 0 ? edges[edges.length - 1].cursor : undefined;

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor,
      },
    };
  }

  async clearDocuments(): Promise<void> {
    await this.vehicleMakeModel.deleteMany({}).exec();
  }
}
