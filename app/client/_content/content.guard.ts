
import { Injectable } from '@angular/core';
import { LocalStorageService } from '../_common/index';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot } from '@angular/router';

@Injectable()
export class ContentGuard implements CanActivate
{
    constructor(
      private router: Router,
      private localStorageService: LocalStorageService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    {
      if (this.localStorageService.get('MOJI_TOKEN'))
      {
          return true;
      }
      this.router.navigate(['/login']);
      return false;
    }
}
