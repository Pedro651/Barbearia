import { Body, Controller, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { LoginDto } from "./dto/login-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { FileInterceptor } from "@nestjs/platform-express";



@Controller('users')
export class UserController{
    constructor(private readonly userService:UserService) {}

    @Post('create')
    createUser(@Body() createUserDto:CreateUserDto ){
        return this.userService.create(createUserDto)
    }
  
    

  
    @UseGuards(AuthTokenGard)
    @Patch(":id")
    updateUSer(
      @Param("id",)id:string,
      @Body()updateUser:UpdateUserDto ,
      @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ){

       return this.userService.update(id,updateUser,tokenPayload)
    }

    
    @UseGuards(AuthTokenGard) 
    @UseInterceptors(FileInterceptor('file'))  
    @Post('avatar')
    async uploadAvatar(
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
        @UploadedFile(
          new ParseFilePipeBuilder().addFileTypeValidator({
            fileType: /jpeg|jpg|png/g,
          })
          .addMaxSizeValidator({
            maxSize: 100 * (1024 * 1024)
          })
          .build({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
          }),
        ) file: Express.Multer.File
    ){

      return this.userService.uploadAvatarImage(tokenPayload, file)
    }
}
