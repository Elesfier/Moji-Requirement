
import { Router, Response, Request } from 'express';
import { IUser, UserModel } from '../_model/index';
import { authorization } from '../_common/index';

export const user = Router();

user.get('/user', authorization({

  project: {},
  global: { mustBeLogged: true },
  get: ['notifications', 'allowed']

}),(request: Request, response: Response) => {

  //[XXX]: not used

  console.log(request['_currentUser']);
  console.log(request['_get']);

  response.handler({
    type: 'USER_DATA',
    data: {
      username: request['_currentUser'].username,
      firstname: request['_currentUser'].firstname,
      lastname: request['_currentUser'].lastname,
      setting: request['_currentUser'].setting,
      notifications: request['_get'].notifications,
      allowed: request['_get'].allowed
    }
  });

});
