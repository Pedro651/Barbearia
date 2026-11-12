import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class HorarioDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  hour: string;
}