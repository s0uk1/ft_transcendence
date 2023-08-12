import { 
    IsEmail, 
    IsNotEmpty,
    IsInt,
    IsString,
    IsOptional
} from 'class-validator';

export class CreateUserDto {
    
    @IsNotEmpty()
    @IsInt()
    intraid: number;

    @IsNotEmpty()
    @IsString()
    login: string;

    @IsEmail()
    email: string;
}
