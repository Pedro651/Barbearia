import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreateScheduleDto {

  @IsOptional()
  @IsString()
  customer?: string;

  @IsNotEmpty()
  @IsString()
  servico: string;

  @IsNotEmpty()
  @IsString()
  barbeiro: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  hour: string;

  @IsNotEmpty()
  @IsString()
  horarioId: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}