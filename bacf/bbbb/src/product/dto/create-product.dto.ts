import { IsNotEmpty, IsString } from "class-validator"


export class CreateProductDto{
    @IsString()
    @IsNotEmpty({message:"Não pode deixar vazio"})
    name:string
    @IsString()
    @IsNotEmpty({message:"Não pode deixar vazio"})
    avatar:string
    @IsString()
    @IsNotEmpty({message:"Não pode deixar vazio"})
    description:string
    @IsString()
    @IsNotEmpty({message:"Não pode deixar vazio"})
    price:string
}