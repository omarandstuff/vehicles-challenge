import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class VehicleType extends Document {
  @Prop({ required: true })
  typeId: string;

  @Prop({ required: true })
  typeName: string;
}

export const VehicleTypeSchema = SchemaFactory.createForClass(VehicleType);
