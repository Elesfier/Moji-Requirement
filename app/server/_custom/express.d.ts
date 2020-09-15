
import * as express from 'express';

declare module "express"
{
    export interface Response
    {
        handler (params: any): any;
    }
}
