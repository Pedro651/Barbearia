
import { IsNotEmpty, IsString } from "class-validator";

export class ServicoDto {
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "O preço é obrigatório" })
  price: string;
}
