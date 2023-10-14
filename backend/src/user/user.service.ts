import { faker } from '@faker-js/faker';
import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesService } from 'src/profiles/profiles.service';
import { CreateUserDtoIntra } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';

config()

class data {
  intraid: number;
  Hashpassword: string;
  email: string;
  profile: {
    username: string;
    avatar: string;
    login: string;
  }
}

@Injectable()
export class UserService {
  constructor(readonly prisma: PrismaService, readonly profile: ProfilesService) {}
    
  async CreateUsersFake() {
    try {
      for (let i = 0; i < 2; i++) {
        const FakeUser =  new data();
        let firstName = faker.person.firstName();
        let lastName = faker.person.lastName();
        FakeUser.intraid = faker.number.int(500000);
        FakeUser.Hashpassword = faker.number.int(600) + "password";
        FakeUser.email = firstName + lastName + (i*i) + "@gmail.com";

        console.log("FakeUser: ", FakeUser);
        console.log("FirstName: ", firstName);
        console.log("LastName: ", lastName);

        await this.prisma.user.create({
          data: {
            intraid: FakeUser.intraid,
            Hashpassword: FakeUser.Hashpassword,
            email: FakeUser.email,
            profile: {
              create: {
                username: firstName + lastName,
                avatar: "./path/to/avatar/" + lastName + faker.number.int(9000),
                login: firstName + faker.number.int(11),
              },
            }
          }
        })
      }
      return "Fake Users Creatig Success";
    } catch (error) {
      console.log(error);
      return "Error: User Already Exist";
    }
  }

  async CreateUserIntra(reqData: CreateUserDtoIntra) {
      const user = await this.prisma.user.create({
        data: {
          intraid: reqData.intraid,
          email: reqData.email,
          profile: {
            create: {
              username: reqData.profile.username,
              avatar: reqData.profile.avatar,
              login: reqData.profile.login,
            },
          }
        }
      })
      if (!user)
        throw new HttpException('User creation failed: Unprocessable Entity', HttpStatus.UNPROCESSABLE_ENTITY);
      return user;
  }

  async CreateUserLocal(data: any) {
    try {
      const rounds = await parseInt(process.env.BCRYPT_ROUNDS);
      const HashedPassword = await bcrypt.hashSync(data.password, rounds);
      const user = await this.prisma.user.create({
        data: {
          intraid: 33,
          Hashpassword: HashedPassword,
          email: data.email,
          profile: { 
            create: {
              username: data.username,
              avatar: "data.profile.avatar",
              login: data.username,
            },
          }
        }
      })
      if (!user) {
        throw new HttpException('User creation failed: Unprocessable Entity', HttpStatus.UNPROCESSABLE_ENTITY);
        
      }
      return user;
    } catch (error) {
      throw new HttpException('User creation failed: Unprocessable Entity', HttpStatus.UNPROCESSABLE_ENTITY);
    }
}

// this only update User Level : Email : Hashpassword : twofactor
  async UpdateUser(id: number, data: updateUserDto) {
		try {
			const user = await this.prisma.user.findUnique({
				where : {
					id: id,
				},
			});
			if (!user)
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			// let generatedQR = null;
			// if (data.twofactor == true && user.twofactor == false) {
				// const secret = authenticator.generateSecret();
				// const otpauth = authenticator.keyuri(data.email, "pinje-ponge", secret);
				// data.twoFactorSecret = secret;
				// generatedQR = await toDataURL(otpauth);
			// }
    	const updatedUser = await this.prisma.user.update({
      	where: {
					id: id,
				},
      	data: {
        	...data,
        	profile: {
          	update: {
           		...data.profile,
          	},
        	},
      	}
    	})
    	return {updatedUser};
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
  }


  giveRandomAvatar() {
    const avatar = [
      "path://shinra.png",
      "path://stewie.png",
      "path://escanor.png",
    ];
    return avatar[Math.floor(Math.random() * avatar.length)];
  }

  async FindAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    return users;
  }

async FindUserByID(id: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true,
      email: true,
      twofactor: true,
      twoFactorSecret: true,
      profile: {
        select: {
          id : true,
          username: true,
          avatar: true,
          login: true,
          Rank: true,
          level: true,
          sentRequest: true,
          pendingRequest: true,
          blocking: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpException("User not found", HttpStatus.NOT_FOUND);
  }

  return user;
}


  async FindUserByIntraId(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {intraid: id},
    });
    return user;
  }

	async FindUserByEmail(email: string) {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					email: email,
				}
			});
			return user;
		} catch (error) {
			throw new NotFoundException(error);
		}
	}

  async RemoveUsers(id: number) {
    const profile = await this.prisma.profile.delete({
      where: { userid: id },
    });
    const user = await this.prisma.user.delete({
      where: { id: id },
    });
    if (!user)
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    return user;
  }
}
