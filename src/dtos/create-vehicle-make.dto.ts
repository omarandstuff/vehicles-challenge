import { IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVehicleTypeDto } from './create-vehicle-type.dto';

export class CreateVehicleMakeDto {
  @IsString()
  readonly makeId: string;

  @IsString()
  readonly makeName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVehicleTypeDto)
  readonly vehicleTypes: CreateVehicleTypeDto[];
}
