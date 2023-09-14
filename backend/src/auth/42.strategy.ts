import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { config } from 'dotenv';
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { JwtAuthService } from "./jwt.service";

config(); // This loads the .env file

const uid = process.env.UID;
const sid = process.env.SECRET;

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(
      private readonly jwtService: JwtAuthService,
      private readonly userService: UserService,
      private readonly authService: AuthService,
    ){
        super({
            clientID: uid,
            clientSecret: sid,
            callbackURL: "http://localhost:3000/auth/42/callback",
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void): Promise<void> {
      try {
        const newUser = {
          intraid: Number(profile.id),
          email: profile._json.email,
          Hashpassword: null,
          profile: {
            username: profile.username,
            login: profile.username,
          }
        };
        // console.log(newUser);
        const user = await this.authService.userCreateOrNot(newUser);
        const token = await this.jwtService.generateToken(String(user.id));
        done(null, { user, token });
      } catch (error){
        done(error)
      }
    }
}

//  INTRAID: id / _json.email / username