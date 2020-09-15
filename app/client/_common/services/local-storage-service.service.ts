
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService
{
  set (key: string, object: Object): void
  {
    localStorage.setItem(key, JSON.stringify(object));
  }

  get (key: string): any
  {
    return JSON.parse(localStorage.getItem(key));
  }

  rev (key: string): void
  {
    localStorage.removeItem(key);
  }
}
