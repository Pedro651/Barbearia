import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateIf } from "class-validator";

export class PaginationsDto {
    @IsInt()
    @IsOptional()
    @Max(50)
    @Min(0)
    //Converte o valor para number
    @Type(()=> Number)
    limit?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(()=> Number)
    offset?:number

  
    
}