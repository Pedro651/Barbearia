import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsString()
    productId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

//Receber uma lista de produtos que o cliente deseja comprar.
export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}