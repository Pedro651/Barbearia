import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActiveUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Pega o usuário inserido pelo AuthGuard

    // Se você passar um campo específico (ex: @ActiveUser('sub')), retorna só aquele campo
    // Se não passar nada (ex: @ActiveUser()), retorna o objeto de usuário completo
    return field ? user?.[field] : user;
  },
);