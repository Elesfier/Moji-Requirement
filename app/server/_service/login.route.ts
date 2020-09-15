
import { Router, Response, Request } from 'express';
import { IUser, UserModel } from '../_model/index';
import { authorization, changeToLowerCase } from '../_common/index';

export const login = Router();

login.post('/login', authorization({

  global: { mustBeLogged: false }

}),(request: Request, response: Response) => {

  request.body.login = changeToLowerCase(request.body.login);
  
  UserModel.findOne({
    $and: [{
      username: { $exists: true }
    },{
      email: { $exists: true }
    },{
      $or: [{
        email: request.body.login
      },{
        username: request.body.login
      }]
    },{
      password: request.body.password
    }],
  }, (error: any, user: IUser) => {

    if (error)
      return response.handler({ DBError: true, error: error });

    if (user) {
      console.log(user.isAdmin);
      if (user.isAdmin) {
        response.handler({ type: true, data: { token: user.token, isAdmin: true } });
      } else {
        response.handler({ type: true, data: { token: user.token } });
      }
    } else {
      response.handler({ type: false });
    }

  });

});
