import { IsString } from "class-validator";



export class ServicoDto{

    @IsString()
    name :string;
}