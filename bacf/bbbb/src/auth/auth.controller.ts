import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { SignInDto } from "./dto/sigin.dto.js";
import { AuthService } from "./auth.service.js";
import { TokenPayloadParam } from "./param/token-payload.param.js";
import { PAyloadTOkenDto } from "./dto/payload-token.dto.js";
import { AuthTokenGard } from "./guard/auth-token.guard.js";
import { RoleDTO } from "./dto/role.dto.js";

@Controller('auth')
export class AuthController{
     constructor(
        private readonly authService: AuthService
    ){}

    @Post('login')
    sigIn(@Body() sigInDto:SignInDto){
        return this.authService.authenticate(sigInDto)
    }

    @UseGuards(AuthTokenGard)
    @Get('pegar')
    userget(
      @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ) {
      return this.authService.getUser(tokenPayload);
    }

    @UseGuards(AuthTokenGard)
    @Get('getTodas')
    pegarTodasContas() {
      return this.authService.getContas();
    }

    



    @UseGuards(AuthTokenGard)
    @Post('rolee')
    adminClient(
      @Body() roleDTO: RoleDTO,
      @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ){

      return this.authService.rolee(tokenPayload,roleDTO)

    }


    @UseGuards(AuthTokenGard)
    @Delete(':id')
    deleteUser(@Param("id")id:string,@TokenPayloadParam() tokenPayload: PAyloadTOkenDto){
      return this.authService.deleteUser(id,tokenPayload)
    }

}