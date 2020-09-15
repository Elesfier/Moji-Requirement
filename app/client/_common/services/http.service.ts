
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalStorageService } from './local-storage-service.service';
import 'rxjs/add/operator/map';

@Injectable()
export class HttpService
{
    constructor (
      private http: HttpClient,
      private localStorageService: LocalStorageService)
    {
      
    }

    public getToken(): string
    {
      return this.localStorageService.get('MOJI_TOKEN');
    }

    private createURLSearchParams (searchParams: Object): any
    {
      let search = null;
      if (searchParams)
      {
        search = new HttpParams();
        Object.keys(searchParams).forEach((key)=>{
          search.append(key, searchParams[key]);
        });
      }
      return search;
    }

    post (url: string, body: Object = {}, attachToken: boolean = true)
    {
      return this.http.post('/api'+url, body, {
        headers: (attachToken)?{'Authorization': this.getToken()}:undefined
      });
    }

    patch (url: string, body: Object = {}, attachToken: boolean = true)
    {
      return this.http.patch('/api'+url, body, {
        headers: (attachToken)?{'Authorization': this.getToken()}:undefined
      });
    }

    put (url: string, body: Object = {}, attachToken: boolean = true)
    {
      return this.http.put('/api'+url, body, {
        headers: (attachToken)?{'Authorization': this.getToken()}:undefined
      });
    }

    get (url: string, search: Object = undefined, attachToken: boolean = true)
    {
      return this.http.get('/api'+url, {
        params: (search)?(this.createURLSearchParams(search)):(search),
        headers: (attachToken)?{'Authorization': this.getToken()}:undefined
      });
    }

    //[XXX]: I need that?
    download (url: string, search: Object = undefined, attachToken: boolean = true)
    {
      return this.http.get('/api'+url, {
        params: (search)?(this.createURLSearchParams(search)):(search),
        headers: (attachToken)?{'Authorization': this.getToken()}:undefined
      });
    }

    delete (url: string, search: Object = undefined, attachToken: boolean = true)
    {
      return this.http.delete('/api'+url, {
        params: (search)?(this.createURLSearchParams(search)):(search),
        headers: (attachToken)?{'Authorization': this.getToken()}:undefined
      });
    }

}
