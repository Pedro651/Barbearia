import { IsString } from "class-validator";



export class CortesDto {

    @IsString()
    name:string;
}