import { Injectable } from '@nestjs/common';
import { find } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { Req } from '@nestjs/common';
import { CreateUserDtoLocal } from 'src/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
    ) {}

    async userCreateOrNot(user: any) {
      const checkUser = await this.userService.FindUserByIntraId(user.intraid);
      if (checkUser) {
          console.log("user already exists");
          return checkUser;
    	}
      else {
      	const userCreated = await this.userService.CreateUserIntra(user);
        return userCreated;
      }
    }

		async validateUser(email: string, Hashpassword: string){
      console.log("validateUser");
			const findUser = await this.userService.FindUserByEmail(email);
			if (findUser && bcrypt.compareSync(Hashpassword, findUser.Hashpassword)) {
				return findUser;
			}
			return null;
		}

    async signUp(body: any) {
      try {
        // console.log(body);
        // const user = {
				//   ...body,
				//   // profile: {
			  //   //   ...body.profile
				//   // },
				// };
        console.log("we got here");
        console.log(body);
        const user = await this.userService.CreateUserLocal(body);
        return user;
        // return userCreated;
        // console.log(body);
        // return body;
      } catch (error) {
        console.log("error");
        return "Couldn't Create User"
      }
    }
}
