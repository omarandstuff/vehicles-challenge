import { IsString } from 'class-validator';

export class CreateVehicleTypeDto {
  @IsString()
  readonly typeId: string;

  @IsString()
  readonly typeName: string;
}
