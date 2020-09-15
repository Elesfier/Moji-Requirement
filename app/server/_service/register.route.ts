
import { Router, Response, Request } from 'express';
import { IUser, UserModel } from '../_model/index';
import { generateRandomString } from '../_common/index';
import { authorization, JWT_TOKEN_SECRET, changeToLowerCase } from '../_common/index';
import * as jwt from 'jsonwebtoken';

export const register = Router();

register.post('/register', authorization({

    global: { mustBeLogged: false, allowed: true }

}),(request: Request, response: Response) => {
  request.body.username = changeToLowerCase(request.body.username);
  request.body.email = changeToLowerCase(request.body.email);
  UserModel.findOne({
    $or: [
      {username: request.body.username},
      {email: request.body.email}
    ]
  },(error: any, user: IUser) => {
    if (error)
      return response.handler({ DBError: true, error: error });

    const userData = request.body;

    if (user)
    {
      userData.username = userData.username.toLowerCase();
      userData.email = userData.email.toLowerCase();

      if (user.username == userData.username && user.email == userData.email)
      {
        response.handler({ type: 'USER_EXIST_WITH_EMAIL_AND_USERNAME' });
      }
      else if (user.email == userData.email)
      {
        response.handler({ type: 'USER_EXIST_WITH_EMAIL' });
      }
      else if (user.username == userData.username)
      {
        response.handler({ type: 'USER_EXIST_WITH_USERNAME' });
      }
    }
    else
    {
      let newUser = new UserModel({
        username: userData.username,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        token: generateRandomString()
      });

      newUser.save().then((createdUser: IUser) => {

        createdUser.token = jwt.sign(<Object>{
          _id: <string>createdUser._id,
          username: <string>userData.username,
          password: <string>userData.password,
          email: <string>userData.email
        }, JWT_TOKEN_SECRET);

        createdUser.save().then(()=>{
          response.handler({ type: 'USER_CREATED' });
        });

      });

    }
  });

});
