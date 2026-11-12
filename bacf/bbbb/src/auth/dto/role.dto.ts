import { IsEnum } from "class-validator";

enum ROLE {
  ADMIN = 'ADMIN',
  CLIENTE = 'CLIENTE',
}

export class RoleDTO{
    @IsEnum(ROLE)
    role: ROLE;
}