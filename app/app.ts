
import * as express from 'express';
import * as path from 'path';
import { API, Server, Database } from './server/server';

let config = require('../Moji.config')();

const ip: string = process.env.MOJI_IP
              || config.ip
              || config.test_ip;

const port: number = process.env.MOJI_PORT
				|| process.env.PORT
                || config.port
                || config.test_port;

API.use(express.static(path.join(__dirname, 'client')));

API.use((request : express.Request, response : express.Response ) => {
    response.sendFile(path.join(__dirname, 'client/index.html'));
});

Database.once('open', function RUN_SERVER () { Server.listen(port, ip); });
