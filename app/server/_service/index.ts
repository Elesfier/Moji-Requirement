
import { login } from './login.route';
import { register } from './register.route';
import { user } from './user.route';

export let services = [];

services.push(login);
services.push(register);
services.push(user);
