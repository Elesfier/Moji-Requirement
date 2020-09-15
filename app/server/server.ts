
import * as express from 'express';
import * as http from 'http';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { services } from './_service/index';
import { routes } from './routes/index';

let config = require('../../Moji.config')();

const mongoURL: string = process.env.MOJI_MONGO_URL
                    || config.mongoURL
                    || config.test_mongoURL;

export let API = express();

export let Server = http.createServer(API);

API.use(bodyParser.urlencoded({ extended: true }));

API.use(bodyParser.json({limit: '50mb'}));

API.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

API.use(morgan("dev"));

API.use((request: any, response: any, next: any)=>{
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  response.setHeader('Access-Control-Allow-Headers',
                     'X-Requested-With, content-type, Authorization');
  next();
});

API.use((request: any, response: any, next: any)=>{
  response.handler = function (params: any) {
    return this.status(
      (params.DBError || params.error)?(400):(params.status || 200)
    ).json({
      type: params.type,
      message: (
        (params.DBError && params.error)?
        ('DB_Error: '+ params.error.name + ': ' + params.error.message +'.'):
        (params.message)
      ),
      data: params.data
    });
  };
  next();
});

services.forEach((service: express.Router) => {
  API.use( '/api/service', service );
});

routes.forEach((module: express.Router) => {
  API.use( '/api', module );
});

(<any>mongoose).Promise = global.Promise;

mongoose.connect(mongoURL);

export let Database = mongoose.connection;

Database.on('error', console.error.bind(console, 'connection error:'));
