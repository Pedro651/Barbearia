import { Type } from "class-transformer";
import { IsInt,  IsOptional,  Max, Min } from "class-validator";

export class ListserverDto {
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