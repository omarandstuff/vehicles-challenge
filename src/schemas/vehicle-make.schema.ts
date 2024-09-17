import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VehicleType, VehicleTypeSchema } from './vehicle-type.schema';

@Schema()
export class VehicleMake extends Document {
  @Prop({ required: true })
  makeId: string;

  @Prop({ required: true })
  makeName: string;

  @Prop({ type: [VehicleTypeSchema], default: [] })
  vehicleTypes: VehicleType[];
}

export const VehicleMakeSchema = SchemaFactory.createForClass(VehicleMake);
