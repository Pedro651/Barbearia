import { IsOptional, IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator"

export class UpdateUserDto{

    @IsString()
    @IsOptional()
    name:string

    @IsEmail()
    @IsNotEmpty({message:"Não pode deixar vazio"})
    email:string

    @IsStrongPassword({
        minLength:6,
        minLowercase:1,
        minNumbers:1,
        minSymbols: 0,
    })
    @MinLength(6)
    @IsString()
    @IsNotEmpty({message:"Não pode deixar vazio"})
    password:string 

    
}