import { IsEmail, IsOptional, IsNotEmpty, IsString, IsNumber } from "class-validator"
export class AuthDto{
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsNotEmpty()
    @IsString()
    password:string
    @IsNotEmpty() 
    @IsString()
    action:string

    @IsOptional()
    @IsString()
    firstName?:string
    
}